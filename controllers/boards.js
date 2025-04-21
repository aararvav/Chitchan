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
                res.status(404).send({ error: 'Board Not Found!' });
                return;
            }
            
            const threadId = parseInt(req.params.thread_id, 10);
            if(!isNaN(threadId)){
                // Use findByPk and include Comments
                Threads.findByPk(threadId, {
                    include: [{ 
                        model: Comments, 
                        as: "comments", 
                        order: [['createdAt', 'ASC']] // Order comments ascending
                    }]
                }).then(function(thread){
                    if (thread === null) {
                        res.status(404).send({ error: 'Thread Not Found!' });
                        return;
                    }
                    // Render the thread view
                    res.render('threads', {
                        board: board, 
                        thread: thread,
                        boards: app.locals.boards || []
                    });
                }).catch(function(err){
                    console.error('Error finding thread by PK:', err);
                    res.status(500).send({ error: 'Error retrieving thread data.' });
                });
            }else{
                res.status(400).send({ error: 'Invalid Thread ID!' });
            }
            
        }).catch(function(err){
            console.error('Error finding board for thread view:', err);
            res.status(500).send({ error: 'Something went wrong!' });
        });
    });

    //Post methods.
    app.post('/board/:slug/thread', function(req, res){
        console.log('Received thread creation request:', req.body);  // Debug log added
        
        Boards.findOne({
            where: {
                slug: req.params.slug
            }
        }).then(function(board){
            if(board == null){
                res.status(400).send({ error: 'Board Not Found!' });
                return; 
            }

            // Validate required fields - ADDED
            if(!req.body.subject || !req.body.comment){
                console.log('Missing required fields:', req.body);  // Debug log added
                res.status(400).json({ error: 'Subject and comment are required!' });
                return;
            }

            // Create thread data - FIXED
            var threadData = {
                boardId: board.id,
                subject: helpers.htmlEntities(req.body.subject), // Assuming helpers.htmlEntities exists and works
                author: req.body.name ? helpers.htmlEntities(req.body.name) : 'Anonymous', // Use name field, default to Anonymous
                comment: helpers.htmlEntities(req.body.comment),
                file: req.body.upfile || 'https://s.4cdn.org/image/fp/logo-transparent.png' // Use upfile field, provide default
            };

            console.log('Creating thread with data:', threadData); // Debug log added

            // Create the thread
            Threads.create(threadData).then(function(thread){
                // Redirect to the new thread's page
                res.redirect('/board/' + req.params.slug + '/thread/' + thread.id);
            }).catch(function(err){
                console.error('Thread creation error:', err); // Log error
                res.status(500).json({ error: 'Error creating thread' }); // Send JSON error
            });
        }).catch(function(err){
            console.error('Board find error:', err); // Log error
            res.status(500).json({ error: 'Error finding board' }); // Send JSON error
        });
    });

    app.post('/board/:slug/thread/:thread_id', function(req, res){
        console.log('Received comment creation request:', req.body); // Debug log
        
        // Find Board first (good practice, though slug isn't strictly needed for comment creation)
        Boards.findOne({
            where: { slug: req.params.slug }
        }).then(function(board){
            if(board == null){
                res.status(404).send({ error: 'Board Not Found!' });
                return;
            }

            const threadId = parseInt(req.params.thread_id, 10);
            if(!isNaN(threadId)){
                // Find the thread to reply to
                Threads.findByPk(threadId).then(function(thread){
                    if(thread === null){
                        res.status(404).send({ error: 'Thread Not Found!' });                         
                        return;
                    }
                    
                    // Validate required comment field
                    if (!req.body.comment || req.body.comment.trim() === '') {
                        console.log('Missing required comment field:', req.body); // Debug log
                        // Redirect back with an error message (or render page with error)
                        // For simplicity, redirecting here. A better UX would show error on the form.
                        res.redirect(req.originalUrl + '?error=Comment is required'); 
                        return;
                    }

                    // Create comment data
                    const commentData = {
                        threadId: threadId,
                        author: req.body.name ? helpers.htmlEntities(req.body.name) : 'Anonymous',
                        comment: helpers.htmlEntities(req.body.comment),
                        // Ignoring file upload for now, set to null
                        file: null 
                        // file: req.body.upfile ? helpers.htmlEntities(req.body.upfile) : null // If using text input for URL
                    };

                    console.log('Creating comment with data:', commentData); // Debug log

                    // Create the comment
                    Comments.create(commentData).then(function(comment){
                        // Don't update thread timestamp on reply
                        // Threads.update({updatedAt: new Date()}, {where:{id: threadId}});
                        
                        // Redirect back to the thread page
                        res.redirect(req.originalUrl);

                    }).catch(function(err){ // Catch for Comments.create()
                        console.error('Comment creation error:', err);
                        res.status(500).send({ error: 'Error saving reply.' });
                    });

                }).catch(function(err){ // Catch for Threads.findByPk()
                    console.error('Error finding thread for reply:', err);
                    res.status(500).send({ error: 'Error finding thread.' });
                });
            } else {
                res.status(400).send({ error: 'Invalid Thread ID!' });
            }
        }).catch(function(err){ // Catch for Boards.findOne()
            console.error('Error finding board for reply:', err);
            res.status(500).send({ error: 'Something went wrong!' });
        });
    });

};