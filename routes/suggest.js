var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var userUtils = require('../db_api/userUtils');
var gameUtils = require('../db_api/gameUtils');


router.get('/', function(req, res, next) {
	var pageVars = {};
	pageVars.firsttime = true;
	mongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		userUtils.getUsernameList(db, function(usernames) {
			console.log(usernames);
			pageVars.usernames = usernames;
			res.render('suggest', pageVars);
		});
	});
});

router.post('/', function(req, res, next) {
	var pageVars = {};
	pageVars.firsttime = false;

	// TODO: do some validation on usernames/playerCount
	var usernames = Object.keys(req.body);

	var playerCount = 4; // TODO: get playerCount from req.body
	// take in usernames and a player count, return a list of up to 5 games
	mongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		userUtils.getGameIdsFromUsernames(db, usernames, function(gameIds) {
			gameUtils.getSuggestedPlayerPolls(db, gameIds, function(pollResults) {
				// TODO: do smarter sorting
				pollResults.sort((a, b) => {
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
				}).slice(0, 10).forEach(pr => {
					console.log(pr.results[playerCount - 1].sub_results[0].num_votes);
				});
			});
		});
	});
	res.render('suggest', pageVars);
});

module.exports = router;