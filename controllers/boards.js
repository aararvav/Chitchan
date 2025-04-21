/**
 * Controllers (or routes) for our boards!
 */
const { upload } = require('../lib/fileUtils');
const { validateNewThread, validateNewComment, handleValidationErrors, moderateContent } = require('../lib/validation');
const helpers = require('../lib/helpers');

module.exports = function(app, Boards, Threads, Comments){

    // View board index
    app.get('/board/:slug', async (req, res) => {
        try {
            const board = await Boards.findOne({
                where: { slug: req.params.slug }
            });

            if (!board) {
                return res.status(404).render('error', { error: 'Board Not Found!' });
            }

            const threads = await Threads.findAll({
                where: { boardId: board.id },
                include: [{
                    model: Comments,
                    as: 'comments',
                    limit: 3,
                    order: [['createdAt', 'DESC']]
                }],
                order: [
                    ['isSticky', 'DESC'],
                    ['updatedAt', 'DESC']
                ],
                limit: 10
            });

            res.render('boards', {
                board: board,
                threads: threads,
                boards: app.locals.boards || []
            });
        } catch (err) {
            console.error('Error in board index:', err);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    });

    // View individual thread
    app.get('/board/:slug/thread/:thread_id', async (req, res) => {
        try {
            const board = await Boards.findOne({
                where: { slug: req.params.slug }
            });

            if (!board) {
                return res.status(404).render('error', { error: 'Board Not Found!' });
            }

            const threadId = parseInt(req.params.thread_id, 10);
            if (isNaN(threadId)) {
                return res.status(400).render('error', { error: 'Invalid Thread ID!' });
            }

            const thread = await Threads.findByPk(threadId, {
                include: [{
                    model: Comments,
                    as: 'comments',
                    order: [['createdAt', 'ASC']]
                }]
            });

            if (!thread) {
                return res.status(404).render('error', { error: 'Thread Not Found!' });
            }

            // Increment view count
            await thread.increment('viewCount');

            res.render('threads', {
                board: board,
                thread: thread,
                boards: app.locals.boards || []
            });
        } catch (err) {
            console.error('Error in thread view:', err);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    });

    // Create new thread
    app.post('/board/:slug/thread',
        upload.single('file'),
        validateNewThread,
        handleValidationErrors,
        async (req, res) => {
            try {
                const board = await Boards.findOne({
                    where: { slug: req.params.slug }
                });

                if (!board) {
                    return res.status(404).json({ error: 'Board Not Found!' });
                }

                // Content moderation
                if (!moderateContent(req.body.comment) || !moderateContent(req.body.subject)) {
                    return res.status(400).json({ error: 'Your post contains prohibited content.' });
                }

                const threadData = {
                    boardId: board.id,
                    subject: helpers.htmlEntities(req.body.subject),
                    author: req.body.name ? helpers.htmlEntities(req.body.name) : 'Anonymous',
                    comment: helpers.htmlEntities(req.body.comment)
                };

                const thread = await Threads.createWithFile(threadData, req.file);
                res.redirect(`/board/${req.params.slug}/thread/${thread.id}`);
            } catch (err) {
                console.error('Error creating thread:', err);
                res.status(500).json({ error: 'Error creating thread' });
            }
        }
    );

    // Create new comment
    app.post('/board/:slug/thread/:thread_id',
        upload.single('file'),
        validateNewComment,
        handleValidationErrors,
        async (req, res) => {
            try {
                const thread = await Threads.findByPk(req.params.thread_id);
                
                if (!thread) {
                    return res.status(404).json({ error: 'Thread Not Found!' });
                }

                if (thread.isLocked) {
                    return res.status(403).json({ error: 'Thread is locked' });
                }

                // Content moderation
                if (!moderateContent(req.body.comment)) {
                    return res.status(400).json({ error: 'Your post contains prohibited content.' });
                }

                const commentData = {
                    threadId: thread.id,
                    author: req.body.name ? helpers.htmlEntities(req.body.name) : 'Anonymous',
                    comment: helpers.htmlEntities(req.body.comment)
                };

                await Comments.createWithFile(commentData, req.file);
                
                // Update thread timestamp
                await thread.update({ updatedAt: new Date() });
                
                res.redirect(`/board/${req.params.slug}/thread/${thread.id}`);
            } catch (err) {
                console.error('Error creating comment:', err);
                res.status(500).json({ error: 'Error creating comment' });
            }
        }
    );

};
