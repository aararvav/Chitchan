/*********
 *  This file will export Important setup functions, including .env files and mysql connections.
 *******/

const Sequelize = require("sequelize");

module.exports = {
    getSequelize: async function() {
        // First, connect without Database to create it if needed
        const initSequelize = new Sequelize('mysql', process.env.MYSQL_USER, process.env.MYSQL_PASS, {
            host: process.env.HOST,
            dialect: 'mysql',
            logging: false
        });

        try {
            // Create database if it doesn't exist
            await initSequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DB};`);
            await initSequelize.close();

            // Now connect with the database
            const sequelize = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASS, {
                host: process.env.HOST,
                dialect: 'mysql',
                pool: {
                    max: 5,
                    min: 0,
                    idle: 10000
                },
                logging: console.log,
                define: {
                    timestamps: true
                }
            });

            // Test the Connection
            await sequelize.authenticate();
            console.log('Database connection established successfully.');
            
            return sequelize;
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    },

    seedDatabase: async function(sequelize, models, app) {
        try {
            const { Boards, Comments, Threads } = models;

            // Sync database with force option
            await sequelize.sync({ force: true });
            console.log('Database synced');

            // Create boards
            const boardsData = [
                {
                    id: 1,
                    name: "Politically Incorrect",
                    slug: "pol",
                    description: "Political discussion and news",
                    rules: "Keep it civil. No personal attacks.",
                    isNsfw: false
                },
                {
                    id: 2,
                    name: "Technology",
                    slug: "g",
                    description: "Technology and computing discussion",
                    rules: "Stay on topic. No spam.",
                    isNsfw: false
                },
                {
                    id: 3,
                    name: "Video Games",
                    slug: "v",
                    description: "Video game discussion and news",
                    rules: "Keep it gaming related.",
                    isNsfw: false
                },
                {
                    id: 4,
                    name: "Anime & Manga",
                    slug: "a",
                    description: "Anime and manga discussion",
                    rules: "Keep it anime/manga related.",
                    isNsfw: true
                },
                {
                    id: 5,
                    name: "Random",
                    slug: "b",
                    description: "Random discussion",
                    rules: "Anything goes (within site rules).",
                    isNsfw: true
                }
            ];

            // Create all boards
            for (const boardData of boardsData) {
                await Boards.create(boardData);
            }

            // Create a sample thread
            const board = await Boards.findByPk(1);
            if (board) {
                const thread = await Threads.create({
                    boardId: board.id,
                    subject: "Welcome to Chitchan",
                    author: "Admin",
                    comment: "This is the first thread. Welcome to Chitchan!",
                    file: "https://s.4cdn.org/image/fp/logo-transparent.png",
                    isSticky: true,
                    isLocked: false,
                    viewCount: 0
                });

                // Create a sample comment
                await Comments.create({
                    threadId: thread.id,
                    author: "Mod",
                    comment: "First reply to welcome thread",
                    isHidden: false
                });
            }

            // Update global boards variable
            const allBoards = await Boards.findAll();
            app.locals.boards = allBoards;
            console.log('Database seeded successfully');

        } catch (error) {
            console.error('Error seeding database:', error);
            app.locals.boards = [];
            throw error;
        }
    }
}
