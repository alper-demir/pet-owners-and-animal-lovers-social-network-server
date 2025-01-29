# Pet Owners and Animal Lovers Social Network - Backend

## 📝 Project Overview

This is the backend server for a full-stack social network application designed for pet owners and animal lovers. Developed as a capstone project in Computer Engineering, this server provides robust API endpoints and real-time communication features.

## 🌟 Features

- User authentication and authorizationa
- Profile management
- Real-time messaging
- Image upload capabilities
- Secure password hashing
- JWT-based authentication

## 🛠 Technologies Used

- **Language**: JavaScript (Node.js)
- **Web Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Real-time Communication**: Socket.IO
- **Image Handling**: Multer
- **Password Encryption**: Bcrypt
- **Environment Management**: dotenv

## 📦 Dependencies

- bcrypt: Password hashing
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- express: Web application framework
- jsonwebtoken: Authentication token generation
- mongoose: MongoDB object modeling
- multer: Multipart/form-data handling
- nodemailer: Email sending
- socket.io: Real-time bidirectional event-based communication

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/alper-demir/pet-owners-and-animal-lovers-social-network-server.git
```

2. Install dependencies
```bash
npm install
```

### 🔐 Environment Variables

Create a `.env` file in the project root with the following configuration:

```env
# Server Configuration
PORT=3001

# Database Configuration
MONGO=your_mongodb_connection_string

# Security Configuration
SALT=10
SECRET_KEY=your_secret_token_key

# Email Configuration
EMAIL_ADDRESS=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Client Configuration
CLIENT_URL=http://localhost:3000
```

**Important**: 
- Never commit the `.env` file to version control
- Keep your credentials and sensitive information confidential
- Use strong, unique values for `SECRET_KEY` and other sensitive variables

### Running the Server

- Development mode: `npm run dev`
- Production mode: `npm start`

## 📂 Project Structure

- `controllers/`: Business logic for different routes
- `middlewares/`: Custom middleware functions
- `models/`: Mongoose schema definitions
- `router/`: API route definitions
- `utils/`: Utility functions
- `index.js`: Main server entry point
- `socket.js`: Socket.IO configuration
- `db.js`: Database connection

## 🔒 Authentication

The server uses JSON Web Tokens (JWT) for secure user authentication. Passwords are hashed using bcrypt before storage.

## 📡 Real-time Features

Implemented using Socket.IO for instant messaging and live updates between clients.

## 🌐 Deployment

Deployed on Render: [https://pet-owners-and-animal-lovers-social.onrender.com](https://pet-owners-and-animal-lovers-social.onrender.com)

## 📄 License

This project is open-source.

## 👨‍💻 Author
Alper Demir - [GitHub Profile](https://github.com/alper-demir)