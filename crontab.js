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
	if(stopped != null) data.stopped = stopped;
	data.timestamp = (new Date()).toString();
	return data;
}

exports.create_new = function(name, command, schedule){
	var tab = crontab(name, command, schedule, false);
	db.insert(tab);
}

exports.update = function(data){
	db.update({_id: data._id}, crontab(data.name, data.command, data.schedule, null));
}

exports.status = function(_id, stopped){
	db.update({_id: _id},{$set: {stopped: stopped}});
}

exports.remove = function(_id){
	db.remove({_id: _id}, {});
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

exports.get_backup_names = function(){
	var backups = []
	fs.readdirSync(__dirname + '/crontabs').forEach(function(file){
		// file name begins with backup
		if(file.indexOf("backup") == 0){
			backups.push(file);
		}
	});

	return backups;
}

exports.backup = function(){
	//TODO check if it failed
	fs.createReadStream( __dirname + '/crontabs/crontab.db').pipe(fs.createWriteStream( __dirname + '/crontabs/backup ' + (new Date()).toString().replace("+", " ") + '.db'));
}

exports.restore = function(db_name){
	fs.createReadStream( __dirname + '/crontabs/' + db_name).pipe(fs.createWriteStream( __dirname + '/crontabs/crontab.db'));
	db.loadDatabase(); // reload the database
}

exports.import = function(){
	//TODO
}
