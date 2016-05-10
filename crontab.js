//load database

exports.crontab_db_file = __dirname + '/crontabs/crontab.db';
exports.templates_db_file = __dirname + '/crontabs/templates.db';

var Datastore = require('nedb');
var db = {
	 crontabs: new Datastore({ filename: exports.crontab_db_file, autoload: true }),
 templates: new Datastore({ filename: exports.templates_db_file, autoload: true }),
};
var exec = require('child_process').exec;
var fs = require('fs');
var cron_parser = require("cron-parser")
var os = require("os")
var _ = require('underscore');

exports.log_folder = __dirname + '/crontabs/logs';
exports.env_file = __dirname + '/crontabs/env.db';

crontab = function(name, command, command_template, vars, schedule, stopped, logging){
	var data = {};
	data.name = name;
	data.command = command;
	data.command_template = command_template;
	data.schedule = schedule;
	data.vars = vars || {};
	if(stopped != null) {
		data.stopped = stopped;
	}
	data.timestamp = (new Date()).toString();
	data.logging = logging;
	return data;
}

crontab_template = function(name, command, schedule){
	var data = {};
	data.name = name;
	data.command = command;
	data.schedule = schedule;
	data.timestamp = (new Date()).toString();
	return data;
}

exports.create_new = function(name, command, command_template, vars, schedule, logging){
	var tab = crontab(name, command, command_template, vars, schedule, false, logging);
	tab.created = new Date().valueOf();
	db.crontabs.insert(tab);
}

exports.update = function(data){
	db.crontabs.update({_id: data._id}, crontab(data.name, data.command, data.command_template, data.vars, data.schedule, null, data.logging));
}

exports.status = function(_id, stopped){
	db.crontabs.update({_id: _id},{$set: {stopped: stopped}});
}

exports.remove = function(_id){
	db.crontabs.remove({_id: _id}, {});
}
exports.crontabs = function(callback) {
	exports.templates(function(templates) {
		db.crontabs.find({}).sort({ name: 1 }).exec(function(err, docs){
			for(var i=0; i<docs.length; i++){
				var doc = docs[i];

				if(doc.command_template) {
					var template = _.findWhere(templates, { _id: doc.command_template });

					if(template) {
						doc.command = exports.renderTemplateCommand(template, doc);
						doc.schedule = template.schedule;
					}
				}


				if(doc.schedule == "@reboot")
					doc.next = "Next Reboot"
				else if(doc.schedule)
					doc.next = cron_parser.parseExpression(doc.schedule).next().toString();
			}
			callback(docs);
		});
	})

}

exports.templates = function(callback){
	db.templates.find({}).sort({ name: 1 }).exec(function(err, templates){
		callback(templates);
	});
}

exports.renderTemplateCommand = function(template, cronjob) {
	var vars = cronjob.vars || {};

	return template.command.replace(/{[a-zA-Z]+}/g, function(s) {
		return vars[s.substring(1, s.length - 1)] || 'undefined';
	});

};

exports.create_new_template = function(name, command, schedule){
	var tab = crontab_template(name, command, schedule);
	tab.created = new Date().valueOf();
	db.templates.insert(tab);
}

exports.update_template = function(data){
	db.templates.update({_id: data._id}, crontab_template(data.name, data.command, data.schedule));
}

exports.remove_template = function(_id) {
	db.templates.remove({_id: _id}, {});
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

exports.backup_data = function() {
	//TODO check if it failed
	var crontabData = fs.readFileSync( exports.crontab_db_file ).toString('utf8')
	var templateData = fs.readFileSync( exports.templates_db_file ).toString('utf8')

	return {
		version: 1,
		crontabs: crontabData,
		templates: templateData,
	};
}

exports.backup = function(){
	var backupFile = __dirname + '/crontabs/backup ' + (new Date()).toString().replace("+", " ") + '.db';

	fs.writeFileSync(backupFile, JSON.stringify(exports.backup_data()));
}

exports.restore = function(db_name){
	exports.restore_data(JSON.parse(fs.readFileSync( __dirname + '/crontabs/' + db_name )))
}

exports.restore_data = function(backupData) {
	fs.writeFileSync(exports.crontab_db_file, backupData.crontabs);
	fs.writeFileSync(exports.templates_db_file, backupData.templates);

	db.crontabs.loadDatabase(); // reload the database
	db.templates.loadDatabase();
}

exports.reload_db = function(){
	db.crontabs.loadDatabase();
	db.templates.loadDatabase();
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
