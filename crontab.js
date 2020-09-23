/*jshint esversion: 6*/
//load database
var Datastore = require('nedb');
var path = require("path");

exports.db_folder = process.env.CRON_DB_PATH === undefined ? path.join(__dirname,  "crontabs") : process.env.CRON_DB_PATH;
console.log("Cron db path: " + exports.db_folder);
exports.log_folder = path.join(exports.db_folder, 'logs');
exports.env_file =  path.join(exports.db_folder, 'env.db');
exports.crontab_db_file = path.join(exports.db_folder, 'crontab.db');

var db = new Datastore({ filename: exports.crontab_db_file});
var cronPath = "/tmp";

if(process.env.CRON_PATH !== undefined) {
	console.log(`Path to crond files set using env variables ${process.env.CRON_PATH}`);
	cronPath = process.env.CRON_PATH;
}

db.loadDatabase(function (err) {
	if (err) throw err; // no hope, just terminate
});

var exec = require('child_process').exec;
var fs = require('fs');
var cron_parser = require("cron-parser");
var moment = require('moment'); 

const db_file_name_format = "[backup_]YYYY_MM_DD_HH_MM_ss[.db]";

crontab = function(name, command, schedule, stopped, logging, mailing){
	var data = {};
	data.name = name;
	data.command = command;
	data.schedule = schedule;
	if(stopped !== null) {
		data.stopped = stopped;
	}
	data.timestamp = (new Date()).toString();
	data.logging = logging;
	if (!mailing)
		mailing = {};
	data.mailing = mailing;
	return data;
};

exports.create_new = function(name, command, schedule, logging, mailing){
	var tab = crontab(name, command, schedule, false, logging, mailing);
	tab.created = new Date().valueOf();
	tab.saved = false;
	db.insert(tab);
};

exports.update = function(data){
	var tab = crontab(data.name, data.command, data.schedule, null, data.logging, data.mailing);
	tab.saved = false;
	db.update({_id: data._id}, tab);
};

exports.status = function(_id, stopped){
	db.update({_id: _id},{$set: {stopped: stopped, saved: false}});
};

exports.remove = function(_id){
	db.remove({_id: _id}, {});
};

// Iterates through all the crontab entries in the db and calls the callback with the entries
exports.crontabs = function(callback){
	db.find({}).sort({ created: -1 }).exec(function(err, docs){
		for(var i=0; i<docs.length; i++){
			if(docs[i].schedule == "@reboot")
				docs[i].next = "Next Reboot";
			else
				try {
					docs[i].next = cron_parser.parseExpression(docs[i].schedule).next().toString();
				} catch(err) {
					console.error(err);
					docs[i].next = "invalid";
				}
		}
		callback(docs);
	});
};

exports.get_crontab = function(_id, callback) {
	db.find({_id: _id}).exec(function(err, docs){
		callback(docs[0]);
	});
};

exports.runjob = function(_id, callback) {
	db.find({_id: _id}).exec(function(err, docs){
		var res = docs[0];
		exec(res.command, function(error, stdout, stderr){
			console.log(stdout);
		});
	});
};

// Set actual crontab file from the db
exports.set_crontab = function(env_vars, callback){
	exports.crontabs( function(tabs){
		var crontab_string = "";
		if (env_vars) {
			crontab_string = env_vars + "\n";
		}
		tabs.forEach(function(tab){
			if(!tab.stopped) {
				let stderr = path.join(cronPath, tab._id + ".stderr");
				let stdout = path.join(cronPath, tab._id + ".stdout");
				let log_file = path.join(exports.log_folder, tab._id + ".log");
				let log_file_stdout = path.join(exports.log_folder, tab._id + ".stdout.log");

				if(tab.command[tab.command.length-1] != ";") // add semicolon
					tab.command +=";";

				crontab_string += tab.schedule + " ({ " + tab.command + " } | tee " + stdout + ") 3>&1 1>&2 2>&3 | tee " + stderr;

				if (tab.logging && tab.logging == "true") {
					crontab_string += "; if test -f " + stderr +
					"; then date >> \"" + log_file + "\"" +
					"; cat " + stderr + " >> \"" + log_file + "\"" +
					"; fi";
					
					crontab_string += "; if test -f " + stdout +
					"; then date >> \"" + log_file_stdout + "\"" +
					"; cat " + stdout + " >> \"" + log_file_stdout + "\"" +
					"; fi";
				}

				if (tab.hook) {
					crontab_string += "; if test -f " + stdout +
					"; then " + tab.hook + " < " + stdout +
					"; fi";
				}

				if (tab.mailing && JSON.stringify(tab.mailing) != "{}"){
					crontab_string += "; /usr/local/bin/node " + __dirname + "/bin/crontab-ui-mailer.js " + tab._id + " " + stdout + " " + stderr;
				}

				crontab_string += "\n";
			}
		});

		fs.writeFile(exports.env_file, env_vars, function(err) {
			if (err) {
				console.error(err);
				callback(err);
			}
			// In docker we're running as the root user, so we need to write the file as root and not crontab
			var fileName = process.env.CRON_IN_DOCKER !== undefined  ? "root" : "crontab";
			fs.writeFile(path.join(cronPath, fileName), crontab_string, function(err) {
				if (err) {
					console.error(err);
					return callback(err);
				}

				exec("crontab " + path.join(cronPath, fileName), function(err) {
					if (err) {
						console.error(err);
						return callback(err);
					}
					else {
						db.update({},{$set: {saved: true}}, {multi: true});
						callback();
					}
				});
			});
		});
	});
};

exports.get_backup_names = function() {
	var backups = [];
	fs.readdirSync(exports.db_folder).forEach(function(file) {
		// file name begins with backup
		if(exports.backup_name_is_valid(file)) {
			backups.push(file);
		}
	});

	let sortedArray = backups.sort((a, b) => exports.backup_date(b) - exports.backup_date(a));

	return backups;
};

exports.backup_display_name = function(backup_name) {
	let date = exports.backup_date(backup_name);

	return "Backup - " + date.toString();
}

exports.backup_date = function(backup_name) {
	let moment_date = moment(backup_name, db_file_name_format, true);
	let date = moment_date.toDate();

	return date;
}
exports.backup_name_is_valid = function(backup_name) {
	let moment_date = moment(backup_name, db_file_name_format, true);

	return moment_date.isValid();
}

exports.backup_name = function(date) {
	let moment_date = moment(date);
	let name = moment_date.format(db_file_name_format);

	return name;
}

exports.backup = function(callback) {
	let backup_file_name = exports.backup_name(new Date());
	let backup_path = path.join(exports.db_folder, backup_file_name);

	fs.copyFile(exports.crontab_db_file, backup_path, (err) => {
		if (err) {
			console.error(err);
			return callback(err);
		}
		callback();
	});
};

exports.restore = function(db_name){
	var backup_path = path.join(exports.db_folder, db_name)
	fs.createReadStream(backup_path).pipe(fs.createWriteStream(exports.crontab_db_file));
	db.loadDatabase(); // reload the database
};

exports.reload_db = function(){
	db.loadDatabase();
};

exports.get_env = function(){
	if (fs.existsSync(exports.env_file)) {
		return fs.readFileSync(exports.env_file , 'utf8').replace("\n", "\n");
	}
	return "";
};

exports.import_crontab = function(){
	exec("crontab -l", function(error, stdout, stderr){
		var lines = stdout.split("\n");
		var namePrefix = new Date().getTime();

		lines.forEach(function(line, index){
			line = line.replace(/\t+/g, ' ');
			var regex = /^((\@[a-zA-Z]+\s+)|(([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+))/;
			var command = line.replace(regex, '').trim();
			var schedule = line.replace(command, '').trim();

			var is_valid = false;
			try { is_valid = cron_parser.parseString(line).expressions.length > 0; } catch (e){}

			if(command && schedule && is_valid){
				var name = namePrefix + '_' + index;

				db.findOne({ command: command, schedule: schedule }, function(err, doc) {
					if(err) {
						throw err;
					}
					if(!doc){
						exports.create_new(name, command, schedule, null);
					}
					else{
						doc.command = command;
						doc.schedule = schedule;
						exports.update(doc);
					}
				});
			}
		});
	});
};

exports.autosave_crontab = function(callback) {
	let env_vars = exports.get_env();
	exports.set_crontab(env_vars, callback);
};
