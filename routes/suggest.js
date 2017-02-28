var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var userUtils = require('../db_api/userUtils');
var gameUtils = require('../db_api/gameUtils');

var sortPollResults = function(a, b) {
	if (a.results.length <= playerCount && b.results.length > playerCount) {
		return 1;
	}
	if (b.results.length <= playerCount && a.results.length > playerCount) {
		return -1;
	}
	if (b.results.length <= playerCount && a.results.length <= playerCount) {
		return 0;
	}
	if (a.results[playerCount - 1].sub_results[0].num_votes > b.results[playerCount - 1].sub_results[0].num_votes) {
		return -1;
	}
	if (a.results[playerCount - 1].sub_results[0].num_votes < b.results[playerCount - 1].sub_results[0].num_votes) {
		return 1;
	}
	return 0;
}

router.get('/', function(req, res, next) {
	var pageVars = {};
	pageVars.firsttime = true;
	mongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		userUtils.getUsernameList(db, function(usernames) {
			pageVars.usernames = usernames;
			res.render('suggest', pageVars);
		});
	});
});

router.post('/', function(req, res, next) {
	var pageVars = {};
	pageVars.firsttime = false;
	pageVars.suggestions = [];
	// TODO: do some validation on usernames/playerCount
	var usernames = Array.isArray(req.body.usernames) ? req.body.usernames : [req.body.usernames];
	var playerCount = req.body.playercount ? Number(req.body.playercount) : 4; // TODO: maybe use a different form control with a default value (eg number select)
	// take in usernames and a player count, return a list of up to 5 games
	mongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		userUtils.getGameIdsFromUsernames(db, usernames, function(gameIds) {
			gameUtils.getSuggestedPlayerPolls(db, gameIds, function(pollResults) {
				// TODO: do smarter sorting
				pollResults.sort(sortPollResults).slice(0, 10).forEach(pr => {
					pageVars.suggestions.push(pr.name);
				});
				res.render('suggest', pageVars);
			});
		});
	});

});

module.exports = router;