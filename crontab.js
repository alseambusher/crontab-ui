//load database
var Datastore = require('nedb');
var db = new Datastore({ filename: __dirname + '/crontabs/crontab.db' });
db.loadDatabase(function (err) {
});
var exec = require('child_process').exec;
var fs = require('fs');
var cron_parser = require("cron-parser")

crontab = function(name, command, schedule, stopped){
	var data = {};
	data.name = name;
	data.command = command;
	data.schedule = schedule;
	if(stopped != null) {
		data.stopped = stopped;
	} 
	data.timestamp = (new Date()).toString();
	return data;
}

exports.create_new = function(name, command, schedule){
	var tab = crontab(name, command, schedule, false);
	tab.created = new Date().valueOf();
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
	db.find({}).sort({ created: -1 }).exec(function(err, docs){
		for(var i=0; i<docs.length; i++){
			if(docs[i].schedule == "@reboot")
				docs[i].next = "Next Reboot"
			else
				docs[i].next = cron_parser.parseExpression(docs[i].schedule).next().toString();
		}
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

	// Sort by date. Newest on top
	for(var i=0; i<backups.length; i++){
		var Ti = backups[i].split("backup")[1]
		Ti = new Date(Ti.substring(0, Ti.length-3)).valueOf();
		for(var j=0; j<i; j++){
			var Tj = backups[j].split("backup")[1]
			Tj = new Date(Tj.substring(0, Tj.length-3)).valueOf();
			if(Ti > Tj){
				var temp = backups[i];
				backups[i] = backups[j];
				backups[j] = temp;
			}
		}
	}

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

exports.reload_db= function(){
	db.loadDatabase();
}

// TODO
exports.import_crontab = function(){
	exec("crontab -l", function(error, stdout, stderr){
		var lines = stdout.split("\n");
		lines.forEach(function(line){
			/*
				trim the spaces at edges
				split the line based of space and tab
				remove empty splits
				If the first character is @

			*/
			//if(line.indexOf("@")
		})
		console.log(stdout);	
	});
}
