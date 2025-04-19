/**
 * Controllers (or routes) for our boards!
 */
var helpers = require("../lib/helpers");

module.exports = function(app, Boards, Threads, Comments){

    //view board with all threads.
    app.get('/board/:slug/:page?', function(req, res){
        Boards.findOne({
            where: {
                slug: req.params.slug
            }
        }).then(function(board){
            if(board == null){
                res.status(400).send({ error: 'Board Not Found!' });
            }else{
                //Determine what we want to do... 
                //FIXME: This could all be in it's own method.
                var threadsPerpage = 5; //4chan has 20. Leave 5 for now.
                var pageRequested = req.params.page ? (parseInt(req.params.page, 10) || 0 )-1 : 0;
                var numOfPages = 10; //total of 10 pages.
                var offSet = pageRequested * threadsPerpage;
                var threadConfig = {
                    where: { boardId: board.id },
                    offset: offSet,
                    limit: threadsPerpage,
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: Comments,
                        as: 'comments',
                        limit: 5,
                        order: [['createdAt', 'DESC']]
                    }]
                };
                //Are they over the page limit allowed ?, is it 
                if((!isNaN(req.params.page) || req.params.page === undefined) && (pageRequested < numOfPages)){
                     Threads.findAll(threadConfig).then(function(threads){
                        // Add pagination data
                        var pagination = {
                            currentPage: pageRequested + 1,
                            nextPage: pageRequested < numOfPages - 1 ? pageRequested + 2 : null,
                            totalPages: numOfPages
                        };
                        
                        res.render('boards', {
                            board: board, 
                            threads: threads || [],
                            boards: app.locals.boards || [],
                            pagination: pagination
                        });
                    }).catch(function(err){
                        console.error('Thread query error:', err);
                        res.status(500).send({ error: 'Something went wrong!' });
                    });
                }else{
                    //They are over (aka, on page 11. No such thing exists).
                    res.status(500).send({ error: 'There are only 10 pages available and/or you entered something that wasnt a number' });                    
                }
               
            }
        }).catch(function(err){
            console.error('Board query error:', err);
            res.status(500).send({ error: 'Something went wrong!' });
        });
    });

    //view individual thread
    app.get('/board/:slug/thread/:thread_id', function(req, res){
        //Let's still check if we are in the proper board 
        Boards.findOne({
            where: {
                slug: req.params.slug
            }
        }).then(function(board){
            if(board == null){
                res.status(400).send({ error: 'Board Not Found!' });
            }else{
                 if(!isNaN(req.params.thread_id)){
                    //threads are numbers.
                    Threads.findById(req.params.thread_id, {include: [ {model: Comments, as: "comments", order: "createdAt ASC"}]}).then(function(thread){
                        res.render('threads', {
                            board: board, 
                            thread: thread,
                            boards: app.locals.boards || []
                        });
                    });
                }else{
                    res.status(400).send({ error: 'Thread Not Found!' });
                }
            }
        }).catch(function(err){
            res.status(500).send({ error: 'Something went wrong!' });
        });
    });

    //Post methods.
    app.post('/board/:slug/thread', function(req, res){
        console.log('Received thread creation request:', req.body);  // Debug log
        
        Boards.findOne({
            where: {
                slug: req.params.slug
            }
        }).then(function(board){
            if(board == null){
                res.status(400).send({ error: 'Board Not Found!' });
                return;
            }

            // Validate required fields
            if(!req.body.subject || !req.body.comment){
                console.log('Missing required fields:', req.body);  // Debug log
                res.status(400).json({ error: 'Subject and comment are required!' });
                return;
            }

            // Create thread data
            var threadData = {
                boardId: board.id,
                subject: helpers.htmlEntities(req.body.subject),
                author: req.body.name ? helpers.htmlEntities(req.body.name) : 'Anonymous',
                comment: helpers.htmlEntities(req.body.comment),
                file: req.body.upfile || 'https://s.4cdn.org/image/fp/logo-transparent.png'
            };

            console.log('Creating thread with data:', threadData);  // Debug log

            // Create the thread
            Threads.create(threadData).then(function(thread){
                res.redirect('/board/' + req.params.slug + '/thread/' + thread.id);
            }).catch(function(err){
                console.error('Thread creation error:', err);
                res.status(500).json({ error: 'Error creating thread' });
            });
        }).catch(function(err){
            console.error('Board find error:', err);
            res.status(500).json({ error: 'Error finding board' });
        });
    });

    app.post('/board/:slug/thread/:thread_id', function(req, res){
        //Let's still check if we are in the proper board 
        Boards.findOne({
            where: {
                slug: req.params.slug
            }
        }).then(function(board){
            if(board == null){
                res.status(400).send({ error: 'Board Not Found!' });
            }else{
                 if(!isNaN(req.params.thread_id)){
                    //threads are numbers.
                    Threads.findById(req.params.thread_id).then(function(thread){
                        if(thread === null){
                            res.status(400).send({ error: 'Thread Not Found!' });                         
                        }else{
                            //Create a comment.
                            Comments.create({
                                    threadId: req.params.thread_id,
                                    author: req.body.name,
                                    comment: req.body.comment,
                                    file: req.body.upfile
                            }).then(function(comment){
                                //After we create the new comment. Update the thread with the new create date FROM the comment.
                                Threads.update({createdAt: comment.createdAt}, {where:{id: req.params.thread_id}});
                                res.redirect(req.originalUrl);                                
                            });
                        }
                    });
                }else{
                    res.status(400).send({ error: 'Thread Not Found!' });
                }
            }
        }).catch(function(err){
            res.status(500).send({ error: 'Something went wrong!' });
        });
    });

};