/**
 * Controllers (or routes) for home page only!
 */

module.exports = function(app){

    app.get('/', function(req, res){
        res.render('index', { boards: app.locals.boards || [] });
    });

    app.get('/rules', function(req, res){
        res.render('static/rules', { boards: app.locals.boards || [] });
    });

    app.get('/faq', function(req, res){
        res.render('static/faq', { boards: app.locals.boards || [] });
    });

    app.get('/news', function(req, res){
        res.render('static/news', { boards: app.locals.boards || [] });
    });

    app.get('/blog', function(req, res){
        res.render('static/blog', { boards: app.locals.boards || [] });
    });

    app.get('/support', function(req, res){
        res.render('static/support', { boards: app.locals.boards || [] });
    });

    app.get('/advertise', function(req, res){
        res.render('static/advertise', { boards: app.locals.boards || [] });
    });

    app.get('/press', function(req, res){
        res.render('static/press', { boards: app.locals.boards || [] });
    });

    app.get('/ja', function(req, res){
        res.render('static/japanese', { boards: app.locals.boards || [] });
    });

};