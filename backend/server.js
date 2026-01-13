const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/UserRoute');
const path = require('path');
const { createServer } = require('http');
const { initializeSocket } = require('./socket/Socket');

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
initializeSocket(httpServer);

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/audios", express.static(path.join(__dirname, "audios")));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use('/api', router);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log('Server is running on port:', PORT);
  });
});
