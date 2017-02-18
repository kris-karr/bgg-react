var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var moment = require('moment');
var UserApiServices = require('../bgg_api/user_api');
var userApi = new UserApiServices();
var GameApiServices = require('../bgg_api/game_api');
var gameApi = new GameApiServices();

/* GET users listing. */
router.get('/', function(req, res, next) {
	var pageVars = {};
	pageVars.firsttime = true;
	res.render('add_user', pageVars);
});

router.post('/', function(req, res) {
	var pageVars = {};
	pageVars.firsttime = false;

	var username = req.body.username;
	if (username) {

		mongoClient.connect(process.env.MONGODB_URI, function(err, db) {
			console.log("Connected correctly to server");
			findAndInsertUser(username, db, function(docs) {
				pageVars.userData = docs[0];

				var gameIds = docs[0].gameIds.map(x => x.id);
				findAndInsertGames(gameIds, db, function(docs) {

				});
				res.render('add_user', pageVars);
			});
		});
	} else {
		console.log("Username required");
	}
});

var findAndInsertGames = function(gameIds, db, callback) {
	var collection = db.collection(process.env.MONGODB_GAMEDATA_COLLECTION);

	// TODO: Filter out 'stale' game data
	collection.find({ game_id: { $in: gameIds.map(n => Number(n)) } }).toArray(function(err, docs) {
		var retrievedGameIds = docs.map(x => x.game_id);
		if (retrievedGameIds.length === gameIds.length) {
			// All game data already loaded
			callback(docs);
		} else {
			var missingGameIds = [];
			for (var i = 0; i < gameIds.length; i++) {
				var num = Number(gameIds[i]);
				if (!retrievedGameIds.includes(num)) {
					missingGameIds.push(num);
				}
			}

			getGameDataFromIdSet(collection, missingGameIds, [], function(resultObjectsArray) {
				callback(docs.concat(resultObjectsArray));
			});
		}
	});
}

var getGameDataFromIdSet = function(collection, gameIds, resultObjectsArray, callback) {
	var gameIdSet = [];
	for (var i = 0; i < 10; i++) {
		if (gameIds.length) {
			gameIdSet.push(gameIds.pop());
		} else {
			break;
		}
	}

	gameApi.getGamesDataArray(gameIdSet, function(gameObjectsArray) {
		if (gameObjectsArray) {
			// insert the found game items
			for (var i = 0; i < gameObjectsArray.length; i++) {
				var gameObject = gameObjectsArray[i];
				gameObject.updateTimestamp = moment();
				collection.insertOne(gameObject);
			}

			// recursively grab the rest of the game data, passing along the results we have so far
			if (gameIds.length) {
				setTimeout(function() {
					getGameDataFromIdSet(collection, gameIds, resultObjectsArray.concat(gameObjectsArray), callback)
				}, 5000);
			} else {
				callback(resultObjectsArray.concat(gameObjectsArray));
			}
		} else {
			console.log('Parse or API call failed')
		}
	});
}

var findAndInsertUser = function(username, db, callback) {
	var collection = db.collection(process.env.MONGODB_USERDATA_COLLECTION);

	collection.find({ username: username }).toArray(function(err, docs) {
		var THREE_DAYS_AGO = moment().subtract(3, 'days').startOf('day');
		if (docs.length && moment(docs[0].updateTimestamp).startOf('day').isAfter(THREE_DAYS_AGO)) {
			console.log("Retrieved " + username + " from collection");
			callback(docs);
		} else {
			userApi.getUserDataObject(username, function(userDataObject) {
				if (userDataObject) {
					console.log("Inserted " + username + " into collection");
					userDataObject.updateTimestamp = moment();
					collection.insertOne(userDataObject);
					callback([userDataObject]);
				}
			});
		}
	});
}

module.exports = router;