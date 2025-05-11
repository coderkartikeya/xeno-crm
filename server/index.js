import dotenv from 'dotenv';
import express from 'express';
import { app } from './app.js';
import connectDb from './db/index.js';
import http from 'http';


dotenv.config();

const port = process.env.PORT || 3001;

// Create HTTP server with Express app
const server = http.createServer(app);




// ✅ Connect to MongoDB and Start Server
connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Error:', err);
  });


export default server;
