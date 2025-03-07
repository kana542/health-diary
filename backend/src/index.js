import express from "express";
import cors from "cors";
import "dotenv/config"; // Load environment variables from .env file
import http from "http";

// Import route handlers
import userRouter from "./routes/user-router.js";
import authRouter from "./routes/auth-router.js";
import entryRouter from "./routes/entry-router.js";

// Import middleware
import { errorHandler } from "./middlewares/error-handler.js";

// Import logger utility
import logger from "./utils/logger.js";

const app = express();
const port = process.env.PORT || 3000; // Define the server port

// CORS configuration
const corsOptions = {
   origin: process.env.FRONTEND_URL || "http://localhost:5000", // Allowed frontend URL
   methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
   allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
   credentials: true, // Allow cookies and authentication headers
   optionsSuccessStatus: 204, // Respond with 204 for preflight requests
};

// Middleware setup
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests

// Health check endpoint
app.get("/", (req, res) => {
   res.json({ message: "Health Diary API" });
});

// API routes
app.use("/api/users", userRouter); // User-related routes
app.use("/api/auth", authRouter); // Authentication-related routes
app.use("/api/entries", entryRouter); // Entry-related routes

// Handle undefined routes
app.use((req, res) => {
   res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Graceful shutdown function
const gracefulShutdown = () => {
   logger.info("Received termination signal. Shutting down gracefully...");

   server.close(() => {
      logger.info("HTTP server closed.");

      logger.info("Closing database connections...");

      process.exit(0);
   });

   // Force shutdown if not closed within timeout
   setTimeout(() => {
      logger.error("Forcing shutdown after timeout");
      process.exit(1);
   }, 10000);
};

// Listen for termination signals
process.on("SIGINT", gracefulShutdown); // Handle Ctrl+C
process.on("SIGTERM", gracefulShutdown); // Handle system termination signals
process.on("SIGHUP", gracefulShutdown); // Handle terminal window close

// Start the server
server.listen(port, () => {
   logger.info(`Server running on port ${port}`);
});

export default app;
