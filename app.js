var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient,
	assert = require('assert');

var index = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test');
var add_user = require('./routes/add_user');
var test_game2db = require('./routes/test_game2db');
var suggest = require('./routes/suggest');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/test', test);
app.use('/add_user', add_user);
app.use('/test_game2db', test_game2db);
app.use('/suggest', suggest);

app.get('/db', function(request, response) {
	mongoClient.connect(process.env.MONGODB_URL, function(err, db) {
		assert.equal(null, err);
		console.log("Connected correctly to server");

		insertDocuments(db, function() {
			updateDocument(db, function() {
				db.close();
			});
		});
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

var insertDocuments = function(db, callback) {
	var collection = db.collection('documents');

	collection.insertMany([
		{ a: 1 }, { a: 2 }, { a: 3 }
	], function(err, result) {
		assert.equal(err, null);
		assert.equal(3, result.result.n);
		assert.equal(3, result.ops.length);
		console.log("Inserted 3 documents into the document collection");
		callback(result);
	});
}

var updateDocument = function(db, callback) {
	var collection = db.collection('documents');

	collection.updateOne({ a: 2 }, { $set: { b: 1 } }, function(err, result) {
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		console.log("Updated the document with the field a equal to 2");
		callback(result);
	});
}

module.exports = app;