
# ChatApp
A real-time chat application using React, Express, Socket.io, and Prisma.
2️⃣ Features
md
Copy
Edit
## Features
✅ Real-time messaging with WebSockets  
✅ User authentication (email/password, OAuth planned)  
✅ Friend request and search functionality  
✅ Persistent chat history using PostgreSQL  
✅ Responsive UI with Tailwind CSS  
3️⃣ Installation & Setup
md
Copy
Edit
## Installation
### 1️⃣ Clone the repository  
```sh
git clone https://github.com/klaus-0-0/chatApp.git
cd chatApp
2️⃣ Install dependencies
sh
Copy
Edit
npm install
3️⃣ Set up environment variables
Create a .env file and add:

ini
Copy
Edit
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
4️⃣ Start the backend
sh
Copy
Edit
cd server
npm start
5️⃣ Start the frontend
sh
Copy
Edit
cd client
npm start
4️⃣ Deployment Guide
md
Copy
Edit
## Deployment on Render  
### Backend  
- Create a Web Service on Render  
- Set the **Build Command**: `npm install && npm run build`  
- Set the **Start Command**: `npm run start`  
- Add **Environment Variables**:  
DATABASE_URL=your_database_url

markdown
Copy
Edit

### Frontend  
- Create a Web Service on Render  
- Set the **Root Directory**: `client/`  
- Set the **build Command**: `npm install`
- Set the **Start Command**: `npm run start`
5️⃣ API Endpoints
md
Copy
Edit
## API Endpoints
### User Authentication
- `POST /auth/register` → Create a new user
- `POST /auth/login` → Authenticate user

### Messaging
- `GET /messages/:email/:recipient` → Fetch chat history
- `POST /messages` → Send a message

### Friends & Search
- `GET /users` → Fetch all users  
- `POST /friend-request` → Send a friend request  
6️⃣ Tech Stack
md
Copy
Edit
## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS  
- **Backend**: Node.js, Express, Prisma ORM  
- **Database**: PostgreSQL  
- **Real-time**: Socket.io  
- **Hosting**: Render  
7️⃣ Contributing & Issues
md
Copy
Edit
## Contributing
Feel free to submit issues or pull requests.

## Issues
If you find a bug, please open an issue [here](https://github.com/klaus-0-0/chatApp/issues).
