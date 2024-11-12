Instrukcje Setupu

Konfiguracja Serwera
1. Przejdź do folderu backend
    cd backend/
2. Zainstaluj zależności
    npm install
3. Kompilacja pliki TypeScript
   npx tsc --build
4. Stwórz plik .env w folderze dist/
  PORT=3000
  SECRET_KEY=2427aa
5. Przenieś plik data.json do folderu dist/

Uruchomienie Serwera
npm run ts-start

Konfiguracja Frontendu
1. Przejdź do folderu frontend/quiz
   cd frontend/quiz/
2. Zainstaluj zależności
   npm install
   
Uruchom frontend
ng serve
