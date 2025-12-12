# Backend API Endpoints Documentation

**Base URL:** `http://localhost:4000`

---

## Table of Contents
1. [Health & Status](#health--status)
2. [Authentication](#authentication)
3. [Image Upload](#image-upload)
4. [Chat](#chat)
5. [Testing Guide](#testing-guide)
6. [Error Codes](#error-codes)
7. [Environment Variables](#environment-variables)

---

## Health & Status

### Health Check
- **Endpoint:** `GET /api/health`
- **Auth:** Not required
- **Description:** Returns server status, uptime, database connection state, and version info.

**Request:**
```bash
curl -X GET http://localhost:4000/api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "uptime_seconds": 12345,
  "timestamp": "2025-12-10T12:34:56.789Z",
  "version": "1.0.0",
  "env": "development",
  "database": "connected"
}
```

---

### Test Endpoint
- **Endpoint:** `GET /api/test`
- **Auth:** Not required
- **Description:** Simple sanity check that the backend is running.

**Request:**
```bash
curl -X GET http://localhost:4000/api/test
```

**Response (200):**
```json
{
  "message": "Backend running"
}
```

---

## Authentication

### Register User
- **Endpoint:** `POST /api/auth/register`
- **Auth:** Not required
- **Content-Type:** `application/json`
- **Description:** Create a new user account with email and password.

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "securePassword123"
  }'
```

**Request Body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "securePassword123"
}
```

**Response (200 - Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Alice",
    "email": "alice@example.com"
  }
}
```

**Response (400 - Validation Error):**
```json
{
  "message": "Email and password required"
}
```

**Response (400 - User Exists):**
```json
{
  "message": "User already exists"
}
```

---

### Login User
- **Endpoint:** `POST /api/auth/login`
- **Auth:** Not required
- **Content-Type:** `application/json`
- **Description:** Authenticate user and return JWT token.

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securePassword123"
  }'
```

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "securePassword123"
}
```

**Response (200 - Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Alice",
    "email": "alice@example.com"
  }
}
```

**Response (400 - Missing Fields):**
```json
{
  "message": "Email and password required"
}
```

**Response (400 - Invalid Credentials):**
```json
{
  "message": "Invalid credentials"
}
```

---

## Image Upload

### Upload Image to Cloudinary
- **Endpoint:** `POST /api/upload`
- **Auth:** Not required (optional: can add JWT protection)
- **Content-Type:** `multipart/form-data`
- **Form Field:** `image` (file input)
- **Description:** Upload an image file to Cloudinary CDN. Returns public URL for the image.

**Request (using curl):**
```bash
curl -X POST http://localhost:4000/api/upload \
  -F "image=@/path/to/image.jpg"
```

**Request (using PowerShell):**
```powershell
$FilePath = "C:\path\to\image.jpg"
$Form = @{ image = Get-Item -Path $FilePath }
Invoke-WebRequest -Uri http://localhost:4000/api/upload -Method Post -Form $Form
```

**Response (200 - Success):**
```json
{
  "success": true,
  "filename": "image.jpg",
  "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1702276800/e-cycle-uploads/abc123def456.jpg",
  "public_id": "e-cycle-uploads/abc123def456"
}
```

**Response (400 - No File):**
```json
{
  "message": "No file uploaded"
}
```

**Response (400 - Invalid Type):**
```json
{
  "message": "Only images allowed"
}
```

**Response (413 - File Too Large):**
```json
{
  "message": "File size exceeds 5MB limit"
}
```

**Response (500 - Cloudinary Error):**
```json
{
  "message": "Upload failed: missing Cloudinary credentials"
}
```

---

## Chat

### Chat Test Page
- **URL:** `http://localhost:4000/test/chat.html`
- **Description:** Interactive web interface for real-time user-seller chat.
- **Features:**
  - Multiple conversations with sellers
  - User type selection (Buyer/Seller)
  - Real-time message display
  - Auto-reply simulation from sellers
  - Message timestamps
  - Responsive design

**How to Use:**
1. Open `http://localhost:4000/test/chat.html` in your browser
2. Enter your name and select user type (Buyer or Seller)
3. Click a seller conversation to open it
4. Type messages and press Enter or click Send
5. Messages display in real-time with timestamps

---

## Testing Guide

### Prerequisites
Ensure the backend is running:
```bash
npm run dev
```

### Testing with Postman

**1. Import Collection:**
- Open Postman
- Create requests for each endpoint listed above
- Save as a collection for reuse

**2. Register a New User:**
- Method: `POST`
- URL: `http://localhost:4000/api/auth/register`
- Body (JSON):
  ```json
  {
    "name": "TestUser",
    "email": "test@example.com",
    "password": "TestPass123"
  }
  ```
- Send and save the returned `token`

**3. Login:**
- Method: `POST`
- URL: `http://localhost:4000/api/auth/login`
- Body (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "TestPass123"
  }
  ```

**4. Upload an Image:**
- Method: `POST`
- URL: `http://localhost:4000/api/upload`
- Body: Form-data
- Key: `image`
- Value: Choose a file (image)
- Send

### Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"Pass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123"}'
```

**Upload Image:**
```bash
curl -X POST http://localhost:4000/api/upload \
  -F "image=@C:\path\to\image.jpg"
```

**Health Check:**
```bash
curl -X GET http://localhost:4000/api/health
```

### Testing in Browser

**1. Health Check:**
- Open: `http://localhost:4000/api/health`

**2. Chat:**
- Open: `http://localhost:4000/test/chat.html`

**3. Upload Test:**
- Open: `http://localhost:4000/test/index.html`

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Missing required fields, invalid input |
| 401 | Unauthorized | Invalid or missing JWT token |
| 413 | Payload Too Large | File exceeds size limit |
| 500 | Server Error | Database error, Cloudinary error |

---

## Environment Variables

Create a `.env` file in the backend root with:

```env
# Database
MONGO_URI=mongodb://localhost:27017/ecycle

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=4000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- JWT tokens expire after a set duration (configurable)
- Images are stored on Cloudinary CDN; URLs are permanent
- Chat is a client-side simulation and doesn't persist to database yet
- CORS is enabled; configure `FRONTEND_URL` for production

---

## Future Enhancements

- [ ] Database persistence for chat messages
- [ ] WebSocket/Socket.IO for real-time messaging
- [ ] Message read receipts
- [ ] Typing indicators
- [ ] File attachments in chat
- [ ] User presence/online status
- [ ] Chat history pagination
- [ ] Notification system
- For upload requests use `form-data` with a `File` field named `image`.
- For protected endpoints include a header `Authorization: Bearer <token>`.

If you want, I can also add example Postman collection JSON that you can import directly; tell me if you want that and I'll generate it.
