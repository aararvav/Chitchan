/* 
 * Project Name: 4chan NodeJS
 * Written by Daniel <daniel.reguero@hotmail.com>
 */
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Model, DataTypes } = require('sequelize');
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
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            slug: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            rules: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            isNsfw: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        }, {
            sequelize,
            modelName: 'boards',
            tableName: 'boards'
        });

        Threads.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            boardId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'boards',
                    key: 'id'
                }
            },
            subject: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            author: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            file: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            thumbnail: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            fileSize: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            fileWidth: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            fileHeight: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            isSticky: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            isLocked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            viewCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            }
        }, {
            sequelize,
            modelName: 'threads',
            tableName: 'threads'
        });

        Comments.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            threadId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'threads',
                    key: 'id'
                }
            },
            author: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            file: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            thumbnail: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            fileSize: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            fileWidth: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            fileHeight: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            isHidden: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        }, {
            sequelize,
            modelName: 'comments',
            tableName: 'comments'
        });

        // Set up relationships
        Threads.belongsTo(Boards, { foreignKey: 'boardId', constraints: true, as: 'board' });
        Boards.hasMany(Threads, { foreignKey: 'boardId', constraints: true, as: 'threads' });

        Comments.belongsTo(Threads, { foreignKey: 'threadId', constraints: true, as: 'thread' });
        Threads.hasMany(Comments, { foreignKey: 'threadId', constraints: true, as: 'comments' });

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