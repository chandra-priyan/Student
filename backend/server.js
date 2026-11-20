require('dotenv').config();
const createApp = require('./app');
const connectDatabase = require('./config/db');

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
  }

  await connectDatabase();
  const port = Number(process.env.PORT) || 5000;
  const server = createApp().listen(port, () => {
    console.log(`Smart Campus API listening on http://localhost:${port}`);
  });

  async function shutdown() {
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.disconnect();
      process.exit(0);
    });
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Unable to start the API:', error.message);
  process.exit(1);
});
