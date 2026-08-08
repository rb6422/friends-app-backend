# Friends App Backend

A robust REST API and real-time backend service for a friend-discovery and networking mobile application (similar to Tinder, but for making friends). Built with **Node.js, Express, TypeScript, and MongoDB**. 

*This project was developed for the **Mobile Device Programming** (Programación de Dispositivos Móviles) course.*

## Features
- **User Authentication:** Secure registration and login using JWT (JSON Web Tokens) and bcrypt password hashing.
- **Profile Management:** Full CRUD operations for user profiles, including profile picture uploads.
- **Cloud Storage:** Integration with Cloudinary for seamless image hosting and management.
- **Discovery & Swiping:** Logic for discovering new users based on filters (country, state, gender, age) and a swiping mechanism (like/pass) to find mutual matches.
- **Real-Time Chat:** Bidirectional, live messaging between matched users powered by **Socket.io**.
- **Data Persistence:** MongoDB Atlas integration using Mongoose for structured data storage (Users, Swipes, Chats, and Messages).

## Tech Stack
- **Runtime & Framework:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** MongoDB, Mongoose
- **Real-Time:** Socket.io
- **Media Storage:** Cloudinary, Multer
- **Security:** jsonwebtoken, bcryptjs, cors

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Running Locally
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The server will run on `http://localhost:5000`.

## Deployment
This project is configured to be easily deployed on services like **Render**. 
- Build command: `npm install && npm run build`
- Start command: `npm start`
