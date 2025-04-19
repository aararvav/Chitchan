/*********
 *  This file will export important setup functions, including .env files and mysql connections.
 *******/

var Sequelize = require("sequelize");

module.exports = {

    getSequelize: function(){
        var seq = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASS, {
            host: process.env.HOST,
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        });
        return seq;
    },

    seedDatabase: function(Boards, Comments, Threads, app){
        var sequelize = this.getSequelize();

        Threads.belongsTo(Boards, { foreignKey: 'board_id', constraints: true, as: 'boards' });
        Boards.hasMany(Threads, { foreignKey: 'board_id', constraints: true, as: 'threads' });

        Comments.belongsTo(Threads, { foreignKey: 'thread_id', constraints: true, as: 'threads' });
        Threads.hasMany(Comments, { foreignKey: 'thread_id', constraints: true, as: 'comments' });

        sequelize.sync({force: true}).then(function(){
            // Create multiple boards
            return Promise.all([
                Boards.findOrCreate({where: {id: 1}, defaults: {name: "Politically Incorrect", slug: "pol"}}),
                Boards.findOrCreate({where: {id: 2}, defaults: {name: "Technology", slug: "g"}}),
                Boards.findOrCreate({where: {id: 3}, defaults: {name: "Video Games", slug: "v"}}),
                Boards.findOrCreate({where: {id: 4}, defaults: {name: "Anime & Manga", slug: "a"}}),
                Boards.findOrCreate({where: {id: 5}, defaults: {name: "Random", slug: "b"}})
            ]).then(function(boards){
                // Create a thread in /pol/
                return Threads.findOrCreate({where: {id: 1}, defaults:{
                    boardId: boards[0][0].id,
                    subject: "First /Pol/ thread",
                    author: "HappyZombies",
                    comment: "This is the comment, pretty nice",
                    file: "https://s.4cdn.org/image/fp/logo-transparent.png"
                }}).then(function(thread){
                    // Create a comment in the thread
                    return Comments.findOrCreate({where: {id: 1}, defaults:{
                        threadId: thread[0].id,
                        author: "420",
                        comment: "This is reply to the thread"
                    }}).then(function(){
                        // Update global variables
                        return Boards.findAll().then(function(allBoards){
                            app.locals.boards = allBoards;
                        }).catch(function(err){
                            console.log("DB Error "+err);
                            app.locals.boards = [{}];
                        });
                    }).catch(function(err){
                        console.log("DB Error: " + err);
                    });
                }).catch(function(err){
                    console.log("DB Error: " + err);
                });
            }).catch(function(err){
                console.log("DB Error: " + err);
            });
        });
    }
}