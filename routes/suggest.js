var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;


router.get('/', function(req, res, next) {
	var pageVars = {};
	pageVars.firsttime = true;
	res.render('suggest', pageVars);
});

router.post('/', function(req, res, next) {
	var pageVars = {};
	pageVars.firsttime = false;

	// console.log(req.body);
	// TODO: do some validation on usernames/playerCount
	var usernames = ['zikky', 'Fazlington']; // TODO: get usernames from req.body
	var playerCount = 4; // TODO: get playerCount from req.body
	// take in usernames and a player count, return a list of up to 5 games
	mongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		getSuggestions(db, usernames, playerCount, function(suggestionList) {

		});
	});
	res.render('suggest', pageVars);
});

var getSuggestions = function(db, usernames, playerCount, callback) {
	var userCollection = db.collection(process.env.MONGODB_USERDATA_COLLECTION);

	userCollection.find({ username: { $in: usernames } }, { gameIds: 1, _id: 0 }).toArray(function(err, docs) {
		var gameIdList = [];
		for (var i = 0; i < docs.length; i++) {
			gameIdList = gameIdList.concat(docs[i].gameIds);
		}

		gameIdList = Array.from(new Set(gameIdList.map(v => v.id)));
		getPlayerCountPolls(db, gameIdList, function(pollsList) {

		});
	});
}

var getPlayerCountPolls = function(db, gameIds, callback) {
	var gameCollection = db.collection(process.env.MONGODB_GAMEDATA_COLLECTION);

	gameCollection.find({}).toArray(function(err, docs) {

	});
}


module.exports = router;