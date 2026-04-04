## Изменения
- Бэкенд: добавлен полноценный CORS (Allow-Methods/Headers) и обработка `OPTIONS` для успешного редактирования объявлений.

## Запуск
1. Docker Compose:
```
docker compose up --build
```
Фронтенд: `http://localhost:5173`  
Бэкенд: `http://localhost:8080`
Ollama: `http://localhost:11434`

2. Локальный Ollama (для AI-функций):
```
irm https://ollama.com/install.ps1 | iex
ollama pull llama3
```
Сервис Ollama должен быть доступен на `http://localhost:11434`.
