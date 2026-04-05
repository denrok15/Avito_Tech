## Изменения
- Бэкенд: добавлен полноценный CORS (Allow-Methods/Headers) и обработка `OPTIONS` для успешного редактирования объявлений.

## Запуск
1.
Фронт: 
cd Client
npm install
npm run dev

Бэк:
cd server
npm install
npm start

Фронтенд: `http://localhost:5173`  
Бэкенд: `http://localhost:8080`
Ollama: `http://localhost:11434`

2. Локальный Ollama (для AI-функций):
``
Скачать Ollama
Windows : irm https://ollama.com/install.ps1 | iex
MacOs: curl -fsSL https://ollama.com/install.sh | sh

Загрузить модель
ollama pull llama3
```
Сервис Ollama должен быть доступен на `http://localhost:11434`.
