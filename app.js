/* 
 * Project Name: chitchan NodeJS
 */

// Import core dependencies
const express = require('express');                 // Web framework for handling routes and middleware
const bodyParser = require('body-parser');         // Middleware for parsing incoming request bodies
const helmet = require('helmet');                  // Helps secure Express apps by setting HTTP headers
const cors = require('cors');                      // Middleware for enabling Cross-Origin Resource Sharing
const rateLimit = require('express-rate-limit');   // Middleware to limit repeated requests
require('dotenv').config();                        // Loads environment variables from a .env file

// Import custom configuration and models
const config = require("./config");
const Boards = require("./models/boards");
const Threads = require("./models/threads");
const Comments = require("./models/comments");

// Create an instance of the Express application
const app = express();

// Setup basic middleware
app.use('/assets', express.static(__dirname + "/public")); // Serve static files from the 'public' folder
app.use(bodyParser.json());                                // Parse incoming requests with JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));        // Parse URL-encoded payloads
app.set('view engine', 'ejs');                             // Set EJS as the view engine

// Function to initialize the app: connects to DB, seeds data, and starts the server
async function initializeApp() {
    try {
        // Get Sequelize instance for database connection
        const sequelize = await config.getSequelize();
        
        // Initialize the Boards model with its schema and settings
        Boards.init({
            name: {
                type: DataTypes.STRING(150),       // Name of the board (max 150 characters)
                allowNull: false                   // Cannot be null
            },
            slug: {
                type: DataTypes.STRING(150),       // URL-friendly identifier
                allowNull: false                   // Cannot be null
            }
        }, {
            sequelize,                             // Use the Sequelize instance
            modelName: 'boards',                   // Model name
            tableName: 'boards'                    // Table name in the database
        });

        // Seed the database with initial data
        console.log("Seeding database...");
        await config.seedDatabase(sequelize, { Boards, Threads, Comments }, app);
        
        // Import and set up route controllers
        const indexController = require("./controllers");
        const boardController = require("./controllers/boards");
        
        indexController(app);                      // Set up root routes
        boardController(app, Boards, Threads, Comments); // Set up board-related routes

        // Start the Express server
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log("Website is running on http://" + process.env.HOST + ":" + port);
        });
    } catch (error) {
        // Log any errors that occur during initialization
        console.error('Failed to initialize application:', error);
        process.exit(1); // Exit with failure code
    }
}

// Call the function to start everything
initializeApp();
