# Friends App - API Documentation

**Base URL (Production):** `https://friends-app-backend-gmnw.onrender.com`

> **Authentication:** All endpoints except Register and Login require a JWT token in the header:
> `Authorization: Bearer <token>`

> **Note:** The free Render instance goes to sleep after inactivity. The first request may take ~50 seconds to respond while the server wakes up.

---

## 1. Authentication

### POST `/api/auth/register`

Register a new user account.

**Content-Type:** `application/json`

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword123",
  "age": 25,
  "gender": "M",
  "country": "Venezuela",
  "state": "Zulia",
  "bio": "Hello! Looking for new friends."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | ✅ | |
| email | string | ✅ | Must be unique |
| password | string | ✅ | |
| age | number | ✅ | |
| gender | string | ✅ | Values: `"M"`, `"F"`, `"Other"` |
| country | string | ✅ | |
| state | string | ✅ | |
| bio | string | ❌ | |

**Response (201 Created):**

```json
{
  "_id": "60d5ec49f1...",
  "name": "John Doe",
  "email": "john@example.com",
  "profilePicture": "",
  "token": "eyJhbGciOiJI..."
}
```

---

### POST `/api/auth/login`

Login with existing credentials.

**Content-Type:** `application/json`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response (200 OK):** Same format as Register response.

**Response (401 Unauthorized):**

```json
{
  "message": "Invalid email or password"
}
```

---

## 2. Users

### GET `/api/users/me`

Get the current logged-in user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):** Full user object (without password).

---

### PUT `/api/users/me`

Update the current user's profile. Supports profile picture upload.

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | ❌ | |
| age | number | ❌ | |
| gender | string | ❌ | Values: `"M"`, `"F"`, `"Other"` |
| country | string | ❌ | |
| state | string | ❌ | |
| bio | string | ❌ | |
| password | string | ❌ | New password |
| profilePicture | file | ❌ | Image file (jpeg, png) — uploaded to Cloudinary |

**Response (200 OK):**

```json
{
  "_id": "60d5ec49f1...",
  "name": "John Doe",
  "email": "john@example.com",
  "profilePicture": "https://res.cloudinary.com/..."
}
```

---

### GET `/api/users/discover`

Get a list of users to swipe on. Returns users that the current user has NOT swiped on yet.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters (all optional):**

| Param | Type | Example |
|-------|------|---------|
| country | string | `?country=Venezuela` |
| state | string | `?state=Zulia` |
| gender | string | `?gender=F` |
| minAge | number | `?minAge=20` |
| maxAge | number | `?maxAge=30` |

**Example:** `GET /api/users/discover?country=Venezuela&gender=F&minAge=18&maxAge=30`

**Response (200 OK):** Array of user objects (max 20 per request, password excluded).

---

## 3. Swipes

### POST `/api/swipes`

Swipe on a user (like or pass). If both users liked each other, a match is created and a chat is automatically generated.

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `application/json`

**Body:**

```json
{
  "targetUserId": "60d5ec49f1...",
  "action": "like"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| targetUserId | string | ✅ | The `_id` of the user being swiped |
| action | string | ✅ | Values: `"like"` or `"pass"` |

**Response (201 Created):**

```json
{
  "message": "Swipe registered successfully",
  "swipe": { ... },
  "match": true,
  "chat": {
    "_id": "60d5ec49f1...",
    "participants": ["userId1", "userId2"],
    "lastMessage": "It's a match! Say hi."
  }
}
```

> `match` is `true` only when both users have liked each other. `chat` is `null` when there is no match.

---

## 4. Chats & Messages

### GET `/api/chats`

Get all chats for the current user, sorted by most recent activity.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):** Array of chat objects with populated participant info (name, profilePicture).

---

### GET `/api/chats/:chatId/messages`

Get messages for a specific chat (paginated, newest first).

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `chatId` — The ID of the chat.

**Query Parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| page | number | 1 | Page number |
| limit | number | 20 | Messages per page |

**Example:** `GET /api/chats/60d5ec.../messages?page=1&limit=20`

**Response (200 OK):** Array of message objects (ordered oldest → newest).

**Response (403 Forbidden):**

```json
{
  "message": "Not authorized to view these messages"
}
```

---

### POST `/api/chats/:chatId/messages/image`

Upload an image to send in a chat. Returns the Cloudinary URL to then emit via WebSocket.

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| image | file | ✅ | Image file (jpeg, png) |

**Response (200 OK):**

```json
{
  "imageUrl": "https://res.cloudinary.com/..."
}
```

---

## 5. WebSockets (Real-Time Chat)

Connect using `socket.io-client`. The WebSocket server runs on the same URL as the REST API.

### Connection

```javascript
import { io } from "socket.io-client";

const socket = io("https://friends-app-backend-gmnw.onrender.com", {
  auth: {
    token: "eyJhbGciOiJI..." // JWT token (without "Bearer " prefix)
  }
});
```

### Events to EMIT (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `join_chat` | `chatId` (string) | Join a chat room to receive messages |
| `send_message` | `{ chatId, content, imageUrl? }` | Send a text or image message |
| `typing` | `{ chatId, isTyping }` | Send typing indicator |

### Events to LISTEN (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | Message object | New message in a joined chat |
| `new_match` | `{ chatId, matchedWith }` | Notification when a mutual like creates a match |
| `typing` | `{ userId, isTyping }` | Another user is typing in the chat |

### Example: Sending a message

```javascript
// 1. Join the chat room first
socket.emit("join_chat", "60d5ec49f1...");

// 2. Send a text message
socket.emit("send_message", {
  chatId: "60d5ec49f1...",
  content: "Hey! Nice to meet you!",
});

// 3. Send an image (upload first via REST, then send the URL)
socket.emit("send_message", {
  chatId: "60d5ec49f1...",
  content: "",
  imageUrl: "https://res.cloudinary.com/..."
});

// 4. Listen for incoming messages
socket.on("receive_message", (message) => {
  console.log("New message:", message);
});

// 5. Listen for new matches
socket.on("new_match", (data) => {
  console.log("New match!", data);
});
```
