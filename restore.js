//load database
var Datastore = require('nedb');

var exec = require('child_process').exec;
var fs = require('fs');

exports.crontabs = function(db_name, callback){
	var db = new Datastore({ filename: __dirname + '/crontabs/' + db_name });
	db.loadDatabase(function (err) {
	});
	db.find({}).sort({ created: -1 }).exec(function(err, docs){
		callback(docs);
	});
};

exports.delete = function(db_name){
	fs.unlink(__dirname + '/crontabs/' + db_name);
};
