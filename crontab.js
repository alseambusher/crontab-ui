//load database
var Datastore = require('nedb');
var db = new Datastore({ filename: __dirname + '/crontabs/crontab.db' });
db.loadDatabase(function (err) {
});
var exec = require('child_process').exec;
var fs = require('fs');
var cron_parser = require("cron-parser")
var os = require("os")

exports.log_folder = __dirname + '/crontabs/logs';
exports.env_file = __dirname + '/crontabs/env.db';

crontab = function(name, command, schedule, stopped, logging){
	var data = {};
	data.name = name;
	data.command = command;
	data.schedule = schedule;
	if(stopped != null) {
		data.stopped = stopped;
	}
	data.timestamp = (new Date()).toString();
	data.logging = logging;
	return data;
}

exports.create_new = function(name, command, schedule, logging){
	var tab = crontab(name, command, schedule, false, logging);
	tab.created = new Date().valueOf();
	db.insert(tab);
}

exports.update = function(data){
	db.update({_id: data._id}, crontab(data.name, data.command, data.schedule, null, data.logging));
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
exports.set_crontab = function(env_vars){
	exports.crontabs( function(tabs){
		var crontab_string = "";
		if (env_vars) {
			crontab_string = env_vars + "\n";
		}
		tabs.forEach(function(tab){
			if(!tab.stopped){
				if (tab.logging && tab.logging == "true"){
					tmp_log = "/tmp/" + tab._id + ".log";
					log_file = exports.log_folder + "/" + tab._id + ".log";
					if(tab.command[tab.command.length-1] != ";") // add semicolon
						tab.command +=";"
					//{ command; } 2>/tmp/<id>.log|| {if test -f /tmp/<id>; then date >> <log file>; cat /tmp/<id>.log >> <log file>; rm /tmp<id>.log }
					crontab_string += tab.schedule + " { " + tab.command + " } 2> " + tmp_log +"; if test -f " + tmp_log +"; then date >> " + log_file + "; cat " + tmp_log + " >> " + log_file + "; rm " + tmp_log + "; fi \n";
					}
				else
					crontab_string += tab.schedule + " " + tab.command + "\n";
			}
		});

		fs.writeFile(exports.env_file, env_vars);
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

exports.get_env = function(){
	if (fs.existsSync(exports.env_file)) {
		return fs.readFileSync(exports.env_file , 'utf8').replace("\n", "\n");
	}
	return ""
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
