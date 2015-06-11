//load database
var Datastore = require('nedb');
var db = new Datastore({ filename: __dirname + '/crontabs/crontab.db' });
db.loadDatabase(function (err) {
});

crontab = function(command, schedule, stopped){
	var data = {};
	data.command = command;
	data.schedule = schedule;
	data.stopped = stopped;
	data.timestamp = (new Date()).toString();
	return data;
}

exports.create_new = function(command, schedule){
	var tab = crontab(command, schedule, false);
	db.insert(tab);
}

exports.crontabs = function(callback){
	var finished = false;
	db.find({}, function(err, docs){
		finished = true;
		callback(docs);
	});
}


