# 💬 ChatApp

A full-stack real-time chat application built with **React** and **Tailwind CSS** on the frontend, and **Node.js + Express + Prisma + PostgreSQL + Socket.io** on the backend.

Users can sign up, login (email/password + Google OAuth), add friends, and chat in real time with message status indicators — all with a responsive and modern UI.

---

## 🔗 Live Demo

- 🌐 Site: https: //whatsapp-32fo.onrender.com/
- 📁 GitHub Repo: https://github.com/klaus-0-0/chatApp

---

## ✨ Features

- 🔐 User Signup/Login with password 
- 👫 Friend requests, accept through mobile number
- 💬 Real-time messaging with Socket.io
- ✔️ Message status indicators: sent, delivered, seen
- ☁️ Backend powered by PostgreSQL and Prisma ORM
- 🎨 Responsive UI styled with Tailwind CSS
- 🔎 User search by phone number

---

## ⚙️ Tech Stack

### 🖥️ Frontend

- React
- Tailwind CSS
- Vite

### 🧠 Backend

- Node.js
- Express
- Socket.io
- Prisma ORM
- PostgreSQL
- Render (hosting & deployment)

---

## 🛠️ Run Locally

### 🔽 Clone the repo

git clone https://github.com/klaus-0-0/chatApp.git
cd chatApp

cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm start

cd frontend
npm install
npm run dev

✅ TODOs
add Google OAuth
block and delete option
