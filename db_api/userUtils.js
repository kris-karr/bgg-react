var mongoClient = require('mongodb').MongoClient;

exports.userCollectionFromDB = function(db) {
	return db.collection(process.env.MONGODB_USERDATA_COLLECTION);
}

exports.getUsernameList = function(db, callback) {
	var userCollection = this.userCollectionFromDB(db);
	userCollection.find({}, { 'username': 1, '_id': 0 }).toArray(function(err, docs) {
		callback(docs.map(u => u.username));
	});
}

exports.getUserData = function(db, username, callback) {
	var userCollection = this.userCollectionFromDB(db);
	userCollection.findOne({ 'username': username }, function(err, doc) {
		callback(doc);
	});
}

exports.upsertUserData = function(db, username, userData, callback) {
	var userCollection = this.userCollectionFromDB(db);
	userCollection.updateOne({ 'username': username }, userData, {upsert: true}, function(err, doc) {
		// TODO: error checking?
		callback(doc);
	});
}

exports.getGameIdsFromUsernames = function(db, usernames, callback) {
	var userCollection = this.userCollectionFromDB(db);
	userCollection.find({ 'username': { '$in': usernames } }, { 'gameIds': 1, '_id': 0 }).toArray(function(err, docs) {
		var gameIdList = [];
		for (var i = 0; i < docs.length; i++) {
			gameIdList = gameIdList.concat(docs[i].gameIds);
		}

		gameIdList = Array.from(new Set(gameIdList.map(v => v.id))).map(Number);
		callback(gameIdList);
	});
}
