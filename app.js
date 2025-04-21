/* 
 * Project Name: chitchan NodeJS
 */
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const config = require("./config");
const Boards = require("./models/boards");
const Threads = require("./models/threads");
const Comments = require("./models/comments");

const app = express();

// Basic middleware
app.use('/assets', express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Initialize database and start server
async function initializeApp() {
    try {
        // Get Sequelize instance
        const sequelize = await config.getSequelize();
        
        // Initialize models with Sequelize instance
        Boards.init({
            name: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            slug: {
                type: DataTypes.STRING(150),
                allowNull: false
            }
        }, {
            sequelize,
            modelName: 'boards',
            tableName: 'boards'
        });

        // Seed database
        console.log("Seeding database...");
        await config.seedDatabase(sequelize, { Boards, Threads, Comments }, app);
        
        // Setup routes
        const indexController = require("./controllers");
        const boardController = require("./controllers/boards");
        
        indexController(app);
        boardController(app, Boards, Threads, Comments);

        // Start server
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log("Website is running on http://" + process.env.HOST + ":" + port);
        });
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
}

initializeApp();
