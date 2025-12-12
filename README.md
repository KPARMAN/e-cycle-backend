# E-Cycle Project (Frontend + Backend)

## Backend
Located in the `backend/` folder. Node.js + Express server with:
- MongoDB (mongoose)
- Authentication (JWT + bcrypt)
- Image uploads (multer)

### Quick start
1. `cd backend`
2. copy `.env.example` to `.env` and set values (MONGO_URI, JWT_SECRET, FRONTEND_URL)
3. `npm install`
4. `npm run dev`

### Important endpoints
- POST /api/auth/register { name, email, password }
- POST /api/auth/login { email, password }
- POST /api/upload (form-data, field name: image)
- GET /api/test
- GET /api/health

## Testing the chat UI (local)

1. Start the backend from the `backend` folder:

```powershell
npm run dev
```

2. Open the chat test page in your browser (served by the backend):

```
http://localhost:4000/test/chat.html
```

Notes:
- Do not open the test HTML via `file://` — instead use the URL above. The test client includes a fallback to `http://localhost:4000` when opened from `file://`, but serving over HTTP avoids CORS and socket issues.
- If you serve the `test/` folder using a separate static server (for example `npx http-server ./test -p 5173`), set `FRONTEND_URL` in your `.env` to that origin or leave it unset to allow all origins.
