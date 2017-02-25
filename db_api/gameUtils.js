var mongoClient = require('mongodb').MongoClient;

let gameCollectionFromDB = function(db, callback) {
	callback(db.collection(process.env.MONGODB_GAMEDATA_COLLECTION));
}

exports.getSuggestedPlayerPolls = function(db, gameIds, callback) {
	gameCollectionFromDB(db, function(gameCollection) {
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
	})
}