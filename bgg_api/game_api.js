module.exports = function ApiManager() {
	'use strict';
	var request = require('request');
	var xml2js = require('xml2js');
	var gameXmlParser = function(xmlData, username, callback) {
		xml2js.parseString(xmlData, function(err, result) {
			var cleanObjects = [],
				dirtyObjects = result.items.item,
				i,
				returnObject = {};

			for (i = 0; i < dirtyObjects.length; i++) {
				var gameIdObject = {};
				gameIdObject.id = dirtyObjects[i].$.objectid;
				gameIdObject.name = dirtyObjects[i].name[0]._;
				cleanObjects.push(gameIdObject);
			}
			returnObject.username = username;
			returnObject.gameIds = cleanObjects;
			callback(returnObject);
		});
	};

	return {
		getGameDataObject: function(gameId, callback) {
			var path = process.env.BGG_XMLAPI_URI + 'thing?id=' + gameId;
			request(path, function(err, res, body) {
				userXmlParser(body, username, callback);
			});
		}
	};
};