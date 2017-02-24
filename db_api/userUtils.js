var mongoClient = require('mongodb').MongoClient;

let userCollectionFromDB = function(db, callback) {
	callback(db.collection(process.env.MONGODB_USERDATA_COLLECTION));
}

exports.getUsernameList = function(db, callback) {
	userCollectionFromDB(db, function(userCollection) {
		userCollection.find({}, { 'username': 1, '_id': 0 }).toArray(function(err, docs) {
			callback(docs.map(u => u.username));
		});
	});
}

exports.getUserData = function(db, username, callback) {
	userCollectionFromDB(db, function(userCollection) {
		userCollection.findOne({ 'username': username }, function(err, doc) {
			callback(doc);
		});
	});
}

exports.getGameIdsFromUsernames = function(db, usernames, callback) {
	userCollectionFromDB(db, function(userCollection) {
		userCollection.find({ 'username': { '$in': usernames } }, { 'gameIds': 1, '_id': 0 }).toArray(function(err, docs) {
			var gameIdList = [];
			for (var i = 0; i < docs.length; i++) {
				gameIdList = gameIdList.concat(docs[i].gameIds);
			}

			gameIdList = Array.from(new Set(gameIdList.map(v => v.id))).map(Number);
			callback(gameIdList);
		});
	});
}