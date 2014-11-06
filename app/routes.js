var express    = require('express');

module.exports = function(app) {

	var pageRouter = express.Router(); 

	pageRouter.get('/', function(req, res) {
		res.sendfile('./public/game.html');
	});

	pageRouter.get('/game', function(req, res) {
		res.sendfile('./public/game.html');
	});

	app.use('/', pageRouter);

};