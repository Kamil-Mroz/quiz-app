import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { SolvedQuiz, User } from './types/user'
import { Quiz } from './types/quiz'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000
const SECRET_KEY = process.env.SECRET_KEY || 'defaultKey'

app.use(bodyParser.json())

const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.join(__dirname, 'data.json')

interface Data {
  users: User[]
  quizzes: Quiz[]
}

function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(
      DATA_PATH,
      JSON.stringify({ users: [], quizzes: [] }),
      'utf-8'
    )
  }
  const data = fs.readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(data)
}

function saveData(data: Data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']
  if (!token) {
    res.status(401).json({ message: 'Access denied' })
    return
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' })
      return
    }
    req.user = user as User
    next()
  })
}

function checkOwnership(req: Request, res: Response, quiz: Quiz) {
  if (quiz.createdBy !== req.user?.username) {
    res
      .status(403)
      .json({ message: 'Access denied: You are not the owner of this quiz' })
    return false
  }
  return true
}

app.post('/register', async (req: Request, res: Response) => {
  const { username, password, email } = req.body
  const data = loadData()

  if (data.users.find((user: User) => user.username === username)) {
    res.status(400).json({ message: 'User already exists' })
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  data.users.push({
    username,
    password: hashedPassword,
    email,
    solvedQuizzes: [],
  })
  saveData(data)

  res.status(201).json({ message: 'User registered successfully' })
})

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  const data: Data = loadData()
  const user = data.users.find((user: User) => user.username === username)

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400).json({ message: 'Invalid credentials' })
    return
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1d' })

  res.json({ message: 'Login successfully', token })
})

app.get('/profile', authenticate, (req: Request, res: Response) => {
  const data: Data = loadData()
  const user = data.users.find((u: User) => u.username === req.user?.username)

  if (!user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const solvedQuizzes: SolvedQuiz[] = user.solvedQuizzes ?? []
  const totalQuizzesSolved = solvedQuizzes.length
  const accuracy =
    totalQuizzesSolved > 0
      ? solvedQuizzes.reduce(
          (acc: number, quiz: SolvedQuiz) => acc + (quiz.accuracy ?? 0),
          0
        ) / totalQuizzesSolved
      : 0

  res.json({
    user: {
      username: user.username,
      email: user.email,
      solvedQuizzes: solvedQuizzes,
    },
    stats: {
      totalQuizzesSolved: totalQuizzesSolved,
      accuracy: accuracy,
    },
  })
})

app.get('/quizzes', (req: Request, res: Response) => {
  const { category, search, sortBy } = req.query
  const data: Data = loadData()

  let quizzes: Quiz[] = data.quizzes

  if (category && typeof category === 'string') {
    quizzes = quizzes.filter((quiz: Quiz) => quiz.category === category)
  }
  if (search && typeof search === 'string') {
    quizzes = quizzes.filter((quiz: Quiz) =>
      quiz.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    )
  }
  if (sortBy && typeof sortBy === 'string') {
    quizzes = quizzes.sort((quizA, quizB) => {
      if (sortBy === 'desc') {
        return quizA.title.localeCompare(quizB.title)
      }
      return quizB.title.localeCompare(quizA.title)
    })
  }

  res.json(quizzes)
})

app.post('/quizzes', authenticate, (req: Request, res: Response) => {
  const data: Data = loadData()
  const newQuiz: Quiz = {
    id: Date.now(),
    ...req.body,
    createdBy: req.user?.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.quizzes.push(newQuiz)
  saveData(data)

  res.json({ message: 'Quiz created successfully', quiz: newQuiz })
})

app.put('/quizzes/:id', authenticate, (req: Request, res: Response) => {
  const data: Data = loadData()
  const quizId = parseInt(req.params.id)
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.id === quizId)

  if (quizIndex === -1) {
    res.status(404).json({ message: 'Quiz not found' })
    return
  }

  const quiz = data.quizzes[quizIndex]
  if (!checkOwnership(req, res, quiz)) return

  data.quizzes[quizIndex] = {
    ...quiz,
    ...req.body,
    updatedAt: new Date().toISOString(),
  }
  saveData(data)

  res.json({
    message: 'Quiz updated successfully',
    quiz: data.quizzes[quizIndex],
  })
})

app.delete('/quizzes/:id', authenticate, (req: Request, res: Response) => {
  const data: Data = loadData()
  const quizId = parseInt(req.params.id)

  const quizIndex = data.quizzes.findIndex((quiz) => quiz.id === quizId)

  if (quizIndex === -1) {
    res.status(404).json({ message: 'Quiz not found' })
    return
  }

  const quiz = data.quizzes[quizIndex]
  if (!checkOwnership(req, res, quiz)) return

  data.quizzes.splice(quizIndex, 1)
  saveData(data)

  res.json({ message: 'Quiz deleted successfully' })
})

app.get(
  '/quizzes/:quizId/questions',
  authenticate,
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizId)
    const data: Data = loadData()
    const quiz = data.quizzes.find((q) => q.id === quizId)

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' })
      return
    }

    res.json(quiz.questions)
  }
)

app.post(
  '/quizzes/:quizId/attempt',
  authenticate,
  (req: Request, res: Response) => {
    const { answers } = req.body
    const quizId = parseInt(req.params.quizId)
    const user = req.user
    const data: Data = loadData()
    const quiz = data.quizzes.find((q) => q.id === quizId)

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' })
      return
    }

    let score = 0
    quiz.questions.forEach((question, index) => {
      if (question.correctAnswer == answers[index]) {
        score++
      }
    })
    const accuracy = ((score / quiz.questions.length) * 100).toFixed(2)

    const existingUser = data.users.find((u) => u.username === user?.username)

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const solvedQuiz: SolvedQuiz = {
      quizId,
      accuracy: parseFloat(accuracy),
    }

    const existingSolvedQuiz = existingUser.solvedQuizzes?.find(
      (sq) => sq.quizId === quizId
    )

    if (existingSolvedQuiz) {
      existingSolvedQuiz.accuracy = parseFloat(accuracy)
    } else {
      existingUser.solvedQuizzes = existingUser.solvedQuizzes || []
      existingUser.solvedQuizzes.push(solvedQuiz)
    }

    saveData(data)

    res.json({
      message: 'Quiz submitted',
      score,
      totalQuestions: quiz.questions.length,
      accuracy: accuracy,
    })
  }
)

app.get(
  '/quizzes/:quizId/question/:questionId',
  authenticate,
  (req: Request, res: Response) => {
    const data: Data = loadData()
    const quizId = parseInt(req.params.quizId)
    const questionId = parseInt(req.params.questionId)
    const quiz = data.quizzes.find((quiz) => quiz.id === quizId)

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' })
      return
    }

    if (!checkOwnership(req, res, quiz)) return

    const question = quiz.questions.find((q) => q.id === questionId)
    if (!question) {
      res.status(404).json({ message: 'Question not found' })
      return
    }

    res.json(question)
  }
)

app.post(
  '/quizzes/:quizId/question',
  authenticate,
  (req: Request, res: Response) => {
    const data: Data = loadData()
    const quizId = parseInt(req.params.quizId)

    const quiz = data.quizzes.find((quiz) => quiz.id === quizId)
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' })
      return
    }

    if (!checkOwnership(req, res, quiz)) return

    if (!quiz.questions) quiz.questions = []

    const newQuestion = {
      id: Date.now(),
      ...req.body,
    }

    quiz.questions.push(newQuestion)
    quiz.updatedAt = new Date().toISOString()
    saveData(data)

    res
      .status(201)
      .json({ message: 'Question added successfully', question: newQuestion })
  }
)

app.put(
  '/quizzes/:quizId/question/:questionId',
  authenticate,
  (req: Request, res: Response) => {
    const data: Data = loadData()
    const quizId = parseInt(req.params.quizId)
    const questionId = parseInt(req.params.questionId)

    const quiz = data.quizzes.find((quiz) => quiz.id === quizId)

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' })
      return
    }

    if (!checkOwnership(req, res, quiz)) return

    const questionIndex = quiz.questions.findIndex((q) => q.id === questionId)
    if (questionIndex === -1) {
      res.status(404).json({ message: 'Question not found' })
      return
    }

    quiz.questions[questionIndex] = {
      ...quiz.questions[questionIndex],
      ...req.body,
    }
    quiz.updatedAt = new Date().toISOString()
    saveData(data)
    res.json({
      message: 'Question updated successfully',
      question: quiz.questions[questionIndex],
    })
  }
)

app.delete(
  '/quizzes/:quizId/question/:questionId',
  authenticate,
  (req: Request, res: Response) => {
    const data: Data = loadData()
    const quizId = parseInt(req.params.quizId)
    const questionId = parseInt(req.params.questionId)

    const quiz = data.quizzes.find((quiz) => quiz.id === quizId)
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' })
      return
    }

    if (!checkOwnership(req, res, quiz)) return

    const questionIndex = quiz.questions.findIndex((q) => q.id === questionId)
    if (questionIndex === -1) {
      res.status(404).json({ message: 'Question not found' })
      return
    }

    quiz.questions.splice(questionIndex, 1)
    quiz.updatedAt = new Date().toISOString()
    saveData(data)

    res.json({ message: 'Question deleted successfully' })
  }
)

app.get('/quizzes/categories', (req: Request, res: Response) => {
  const data: Data = loadData()
  const categories = [...new Set(data.quizzes.map((quiz) => quiz.category))]
  res.json(categories)
})

app.get('/quizzes/own', authenticate, (req: Request, res: Response) => {
  const data: Data = loadData()

  const ownQuizzes = data.quizzes.filter(
    (quiz) => quiz.createdBy === req.user?.username
  )

  res.json(ownQuizzes)
})

app.get('/quizzes/:id', (req: Request, res: Response) => {
  const data: Data = loadData()
  const quizId = parseInt(req.params.id)

  const quiz = data.quizzes.find((q) => q.id === quizId)

  if (!quiz) {
    res.status(404).json({ message: 'Quiz not found' })
    return
  }
  res.json(quiz)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
