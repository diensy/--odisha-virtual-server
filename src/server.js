import { env } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';
import { createApp } from './app.js';

await connectDb();

const server = createApp().listen(env.PORT, () => {
  console.log(`OdishaVirtual API on http://localhost:${env.PORT} (chat engine: ${env.aiEnabled ? `Groq (${env.GROQ_MODEL})` : 'rules fallback'})`);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
