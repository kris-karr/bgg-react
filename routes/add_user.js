var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var UserApiServices = require('../bgg_api/user_api');
var userApi = new UserApiServices();

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
				console.log(docs);
				pageVars.userData = docs[0];
				res.render('add_user', pageVars);
				// pageVars.recordCount = docs.length;
				// pageVars.recordNames = [];
				// for(var i=0; i<docs.length; i++) {
				//     pageVars.recordNames.push(docs[i].names[0].value);
				// }
				// res.render('test', pageVars);
				// db.close();
			});
		});
	} else {
		console.log("Username required");
	}
});

var findGames = function(db, callback) {
	var collection = db.collection(process.env.MONGODB_GAME_COLLECTION);

	collection.find({}).toArray(function(err, docs) {
		console.log("Found " + docs.length + " records");
		callback(docs);
	})
}

var findAndInsertUser = function(username, db, callback) {
	var collection = db.collection(process.env.MONGODB_USERDATA_COLLECTION);

	collection.find({ username: username }).toArray(function(err, docs) {
		if (docs.length) {
			console.log("Retrieved " + username + " from collection");
			callback(docs);
		} else {
			userApi.getUserDataObject(username, function(userDataObject) {
				if (userDataObject) {
					console.log("Inserted " + username + " into collection");
					collection.insertOne(userDataObject);
					callback([userDataObject]);
				}
			});
		}
	})
}

module.exports = router;