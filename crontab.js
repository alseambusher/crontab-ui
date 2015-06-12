//load database
var Datastore = require('nedb');
var db = new Datastore({ filename: __dirname + '/crontabs/crontab.db' });
db.loadDatabase(function (err) {
});
var exec = require('child_process').exec;
var fs = require('fs');

crontab = function(name, command, schedule, stopped){
	var data = {};
	data.name = name;
	data.command = command;
	data.schedule = schedule;
	data.stopped = stopped;
	data.timestamp = (new Date()).toString();
	return data;
}

exports.create_new = function(name, command, schedule){
	var tab = crontab(name, command, schedule, false);
	db.insert(tab);
}

exports.crontabs = function(callback){
	db.find({}, function(err, docs){
		callback(docs);
	});
}

exports.set_crontab = function(){
	exports.crontabs( function(tabs){
		var crontab_string = "";
		tabs.forEach(function(tab){
			if(!tab.stopped){
				crontab_string += tab.schedule + " " + tab.command + "\n";
			}
		});
		fs.writeFile("/tmp/crontab", crontab_string, function(err) {
			exec("crontab /tmp/crontab");
		}); 

	});
}
