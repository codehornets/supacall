import express from 'express';
import cors from 'cors';
import router from './routes';
import { SERVER_PORT } from './lib/constants';
import expressWs from 'express-ws';
import { usePhoneCallRouter } from './routes/phone.router';

async function main() {
  const app = express();
  usePhoneCallRouter(expressWs(app).app);

  // Configure CORS with credentials
  app.use(cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true, // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id'],
  }));

  app.use(express.json());

  app.use('/api', router);

  app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
  });
}

main().catch(console.error);