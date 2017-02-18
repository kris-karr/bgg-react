var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var GameApiServices = require('../bgg_api/game_api');
var gameApi = new GameApiServices();

router.get('/', function(req, res, next) {
		var pageVars = {};
		pageVars.firsttime = true;
		res.render('test_game2db', pageVars);
	})
	.post('/', function(req, res) {
		var pageVars = {};
		pageVars.firsttime = false;

		var gameIds = req.body.gameIds;
		if (gameIds) {
			mongoClient.connect(process.env.MONGODB_URI, function(err, db) {
				console.log("Connected correctly to server");
				findAndInsertGames(gameIds, db, function(docs) {
					// console.log(docs);
					pageVars.gamesData = docs;
					res.render('test_game2db', pageVars);
				});
			});
		} else {
			console.log("Game Ids required");
		}
	});

var findAndInsertGames = function(gameIds, db, callback) {
	var collection = db.collection(process.env.MONGODB_GAMEDATA_COLLECTION);

	gameApi.getGamesDataArray(gameIds, function(gameObjectsArray) {
		if (gameObjectsArray) {
			for (var i = 0; i < gameObjectsArray.length; i++) {
				collection.insertOne(gameObjectsArray[i]);
				callback(gameObjectsArray);
			}
		} else {
			console.log('Parse or API call failed')
		}
	});
}

module.exports = router;