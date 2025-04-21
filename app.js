/* 
 * Project Name: chitchan NodeJS
 */

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');     // For parsing request bodies
const helmet = require('helmet');              // For securing HTTP headers
const cors = require('cors');                  // For enabling CORS
const rateLimit = require('express-rate-limit'); // For limiting repeated requests
require('dotenv').config();                    // Load environment variables from .env file

// Import custom configuration and models
var config = require("./config");
var Boards = require("./models/boards");
var Threads = require("./models/threads");
var Comments = require("./models/comments");

// Seed our database with initial data
console.log("Seeding ...");
config.seedDatabase(Boards, Comments, Threads, app);

// Uncomment below to use custom middleware if needed
// var middlewares = require("./middlewares");

// Define custom variables/modules
var port = process.env.PORT || 3000;
var indexController = require("./controllers");
var boardController = require("./controllers/boards");

// Serve static files from the /public directory under the /assets route
app.use('/assets', express.static(__dirname + "/public"));

// Parse incoming request bodies in JSON and URL-encoded format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine for rendering HTML pages
app.set('view engine', 'ejs');

// Initialize routes/controllers
indexController(app);
boardController(app, Boards, Threads, Comments);

// Start server and listen on the specified port
app.listen(port, function(){
    console.log("Website is running on http://" + process.env.HOST + ":" + port);
});
