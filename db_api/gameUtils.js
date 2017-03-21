var mongoClient = require('mongodb').MongoClient;

exports.gameCollectionFromDB = function(db) {
	return db.collection(process.env.MONGODB_GAMEDATA_COLLECTION);
}

exports.getGameDataForGameIds = function(db, gameIds, callback) {
	var gameCollection = this.gameCollectionFromDB(db);
	gameCollection.find({ game_id: { $in: gameIds.map(n => Number(n)) } }).toArray(function(err, docs) {
		callback(docs);
	})
}

exports.getGameDesignersList = function(db, callback) {
	var gameCollection = this.gameCollectionFromDB(db);
	gameCollection.find({}, { _id: 0, 'designers.value': 1 }).toArray(function(err, docs) {
		let designersSet = new Set();
		for (var i = 0; i < docs.length; i++) {
			docs[i].designers.forEach(d => designersSet.add(d.value));
		}
		let designersArray = Array.from(designersSet).sort((a, b) => {
			if (a < b) {
				return -1;
			}
			if (b < a) {
				return 1;
			}
			return 0;
		});
		callback(designersArray);
	})
}

exports.getSuggestedPlayerPolls = function(db, gameIds, callback) {
	var gameCollection = this.gameCollectionFromDB(db);
	gameCollection.aggregate([{ $match: { 'game_id': { '$in': gameIds } } },
		{
			$project: {
				polls: {
					$filter: {
						input: '$polls',
						as: 'poll',
						cond: { $eq: ['$$poll.name', 'suggested_numplayers'] }
					}
				},
				_id: 0,
				game_id: 1,
				names: {
					$filter: {
						input: '$names',
						as: 'gamename',
						cond: { $eq: ['$$gamename.type', 'primary'] }
					}
				}
			}
		}
	]).toArray(function(err, docs) {
		callback(docs.map(function(p) {
			return { 'game_id': p.game_id, 'name': p.names[0].value, 'totalvotes': p.polls[0].totalvotes, 'results': p.polls[0].results }
		}));
	});
}
