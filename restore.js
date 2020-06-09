//load database
var Datastore = require('nedb');
var crontab = require("./crontab");
var path = require("path");

var exec = require('child_process').exec;
var fs = require('fs');

exports.crontabs = function(db_name, callback){
	var db = new Datastore({filename: path.join(crontab.db_folder, db_name)});
	db.loadDatabase(function (err) {
	});
	db.find({}).sort({ created: -1 }).exec(function(err, docs){
		callback(docs);
	});
};

exports.delete = function(db_name){
	fs.unlink(path.join(crontab.db_folder, db_name), function(err){
		if(err) {
			return console.log("Delete error: " + err);
		}
		else{
			console.log("Backup deleted");
		}
	});
};
