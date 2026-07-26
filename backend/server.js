const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/UserRoute');
const path = require('path');
const { createServer } = require('http');
const { initializeSocket } = require('./socket/Socket');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const verificationRoutes = require('./routes/verificationRoutes');

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
app.use('/api/admin', adminRoutes);
app.use('/api', searchRoutes);
app.use('/api', verificationRoutes);


connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log('Server is running on port:', PORT);
    });
  })
  .catch((error) => {
    // Refuse to start without a database. Listening anyway produced a server
    // that accepted traffic and failed every request 10 seconds later.
    console.error('\nCould not start: database connection failed.');
    console.error(`Reason: ${error.message}\n`);
    console.error('Common causes:');
    console.error('  - Your IP is not in the MongoDB Atlas Network Access list.');
    console.error('    Atlas -> Network Access -> Add IP Address -> Add Current IP.');
    console.error('  - The Atlas cluster is paused. Free clusters pause when idle;');
    console.error('    open the Atlas dashboard and resume it.');
    console.error('  - MONGODB_URI in backend/.env is missing or incorrect.\n');
    process.exit(1);
  });
