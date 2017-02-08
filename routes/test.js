var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;

/* GET users listing. */
router.get('/', function(req, res, next) {
    var pageVars = {};
    pageVars.firsttime = true;
    res.render('test', pageVars);
});

router.post('/', function(req, res) {
    var pageVars = {};
    pageVars.firsttime = false;

    mongoClient.connect(process.env.MONGODB_URL, function(err, db) {
        console.log("Connected correctly to server");
        findGames(db, function(docs) {
            pageVars.recordCount = docs.length;
            pageVars.recordNames = [];
            for(var i=0; i<docs.length; i++) {
                pageVars.recordNames.push(docs[i].names[0].value);
            }
            res.render('test', pageVars);
            db.close();
        });
    });
});

var findGames = function(db, callback) {
    var collection = db.collection(process.env.MONGODB_GAME_COLLECTION);

    collection.find({}).toArray(function(err, docs) {
        console.log("Found " + docs.length + " records");
        callback(docs);
    })
}

module.exports = router;
