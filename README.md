# Instrukcje Setupu

## Konfiguracja Serwera

1. Przejdź do folderu backend<br>
   cd backend/
2. Zainstaluj zależności<br>
   npm install
3. Kompilacja pliki TypeScript<br>
   npx tsc --build
4. Stwórz plik .env w folderze dist/<br>
   PORT=3000<br>
   SECRET_KEY=2427aa<br>
5. Przenieś plik data.json oraz folder assets do folderu dist/

## Uruchomienie Serwera

npm run ts-start

## Konfiguracja Frontendu

1. Przejdź do folderu frontend/quiz<br>
   cd frontend/quiz/
2. Zainstaluj zależności<br>
   npm install

## Uruchom frontend

ng serve
