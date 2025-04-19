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
const Boards = require("./models/boards");
const Threads = require("./models/threads");
const Comments = require("./models/comments");

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Basic middleware
app.use('/assets', express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Controllers
const indexController = require("./controllers");
const boardController = require("./controllers/boards");

// Routes
indexController(app);
boardController(app, Boards, Threads, Comments);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Database seeding
const seedDatabase = async () => {
  try {
    console.log("Seeding database...");
    await config.seedDatabase(Boards, Comments, Threads, app);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://${process.env.HOST}:${port}`);
  seedDatabase();
});
