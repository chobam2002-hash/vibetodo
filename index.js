require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backend2';

/** Live Server(5500), Vite dev(5173) — localhost / 127.0.0.1 은 서로 다른 Origin */
const DEFAULT_CLIENT_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function getAllowedOrigins() {
  const extra = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  return [...new Set([...DEFAULT_CLIENT_ORIGINS, ...extra])];
}

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('연결성공');

    const app = express();

    app.use(
      cors({
        origin(origin, callback) {
          const allowed = getAllowedOrigins();
          if (!origin) return callback(null, true);
          if (allowed.includes(origin)) return callback(null, true);
          return callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
        optionsSuccessStatus: 204,
      })
    );

    app.use(express.json());
    app.use('/todos', require('./routers/todoRouter'));

    app.get('/', (req, res) => {
      res.send('OK');
    });

    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (err) {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);
  }
}

start();
