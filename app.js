/* 
 * Project Name: 4chan NodeJS
 * Written by Daniel <daniel.reguero@hotmail.com>
 */
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const config = require("./config");

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting - more lenient configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increase max requests per windowMs
  message: 'Please wait a moment before making more requests.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Apply rate limiting to all routes
app.use(limiter);

// Basic middleware
app.use('/assets', express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Initialize database and start server
const initializeApp = async () => {
  try {
    console.log("Initializing database...");
    
    // Get database connection
    const sequelize = await config.getSequelize();
    
    // Initialize models
    const Boards = require("./models/boards");
    const Threads = require("./models/threads");
    const Comments = require("./models/comments");
    
    // Initialize models with sequelize instance
    Boards.initModel(sequelize);
    Threads.initModel(sequelize);
    Comments.initModel(sequelize);
    
    // Seed database
    await config.seedDatabase(sequelize, { Boards, Threads, Comments }, app);
    console.log("Database initialized successfully");

    // Controllers
    const indexController = require("./controllers");
    const boardController = require("./controllers/boards");

    // Routes
    indexController(app);
    boardController(app, Boards, Threads, Comments);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://${process.env.HOST}:${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
};

initializeApp();