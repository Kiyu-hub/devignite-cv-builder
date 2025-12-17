import serverless from "serverless-http";
import express from "express";
import { registerRoutes } from "../../server/routes.js";
import { initializeAdminUser } from "../../server/admin-init.js";
import { storage } from "../../server/storage.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static uploads
app.use('/uploads', express.static('public/uploads'));

// Initialize routes and admin
let initialized = false;
const initialize = async () => {
  if (!initialized) {
    await registerRoutes(app);
    await initializeAdminUser(storage);
    initialized = true;
  }
};

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error ${status}: ${message}`);
  res.status(status).json({ message });
});

// Netlify Function Handler
export const handler = async (event: any, context: any) => {
  await initialize();
  
  // Rewrite path to add /api prefix since Netlify strips it in the redirect
  if (event.path && !event.path.startsWith('/api')) {
    event.path = '/api' + event.path;
  }
  
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
