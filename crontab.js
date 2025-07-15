/*jshint esversion: 6*/
//load database
const { Low, JSONFile } = require('lowdb');
var path = require("path");

exports.db_folder = process.env.CRON_DB_PATH === undefined ? path.join(__dirname,  "crontabs") : process.env.CRON_DB_PATH;
console.log("Cron db path: " + exports.db_folder);
exports.log_folder = path.join(exports.db_folder, 'logs');
exports.env_file =  path.join(exports.db_folder, 'env.db');
exports.crontab_db_file = path.join(exports.db_folder, 'crontab.json');

const adapter = new JSONFile(exports.crontab_db_file);
const db = new Low(adapter);
async function initDB() {
  await db.read();
  db.data = db.data || { crontabs: [] };
  await db.write();
}
initDB();
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
var cronstrue = require('cronstrue/i18n');
var humanCronLocate = process.env.HUMANCRON ?? "en"

if (!fs.existsSync(exports.log_folder)){
	fs.mkdirSync(exports.log_folder);
}

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

exports.create_new = async function(name, command, schedule, logging, mailing){
  await initDB();
  var tab = crontab(name, command, schedule, false, logging, mailing);
  tab.created = new Date().valueOf();
  tab.saved = false;
  tab._id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  db.data.crontabs.push(tab);
  await db.write();
};

exports.update = async function(data){
  await initDB();
  var tab = crontab(data.name, data.command, data.schedule, null, data.logging, data.mailing);
  tab.saved = false;
  const idx = db.data.crontabs.findIndex(t => t._id === data._id);
  if (idx !== -1) {
	db.data.crontabs[idx] = { ...db.data.crontabs[idx], ...tab };
	await db.write();
  }
};

exports.status = async function(_id, stopped){
  await initDB();
  const idx = db.data.crontabs.findIndex(t => t._id === _id);
  if (idx !== -1) {
	db.data.crontabs[idx].stopped = stopped;
	db.data.crontabs[idx].saved = false;
	await db.write();
  }
};

exports.remove = async function(_id){
  await initDB();
  db.data.crontabs = db.data.crontabs.filter(t => t._id !== _id);
  await db.write();
};

// Iterates through all the crontab entries in the db and calls the callback with the entries
exports.crontabs = async function(callback){
  await initDB();
  let docs = db.data.crontabs.slice().sort((a, b) => b.created - a.created);
  for(let i=0; i<docs.length; i++){
	if(docs[i].schedule == "@reboot")
	  docs[i].next = "Next Reboot";
	else
	  try {
		docs[i].human = cronstrue.toString(docs[i].schedule, { locale: humanCronLocate });
		docs[i].next = cron_parser.parseExpression(docs[i].schedule).next().toString();
	  } catch(err) {
		console.error(err);
		docs[i].next = "invalid";
	  }
  }
  callback(docs);
};

exports.get_crontab = async function(_id, callback) {
  await initDB();
  const doc = db.data.crontabs.find(t => t._id === _id);
  callback(doc);
};

exports.runjob = async function(_id) {
  await initDB();
  let res = db.data.crontabs.find(t => t._id === _id);
  if (!res) return;
  let env_vars = exports.get_env();
  let crontab_job_string_command = make_command(res);
  crontab_job_string_command = add_env_vars(env_vars, crontab_job_string_command);
  console.log("Running job");
  console.log("ID: " + _id);
  console.log("Original command: " + res.command);
  console.log("Executed command: " + crontab_job_string_command);
  exec(crontab_job_string_command, function(error, stdout, stderr){
	if (error) {
	  console.log(error);
	}
  });
};

make_command = function(tab) {
	var crontab_job_string = "";

	let stderr = path.join(cronPath, tab._id + ".stderr");
	let stdout = path.join(cronPath, tab._id + ".stdout");
	let log_file = path.join(exports.log_folder, tab._id + ".log");
	let log_file_stdout = path.join(exports.log_folder, tab._id + ".stdout.log");

	var crontab_job_string_command = tab.command

	if(crontab_job_string_command[crontab_job_string_command.length-1] != ";") { // add semicolon
		crontab_job_string_command +=";";
	}

	crontab_job_string = crontab_job_string_command
	crontab_job_string =  "{ " + crontab_job_string + " }" 
	// write stdout to file
	crontab_job_string =  "(" + crontab_job_string + " | tee " + stdout + ")"
	// write stderr to file
	crontab_job_string = "(" + crontab_job_string + " 3>&1 1>&2 2>&3 | tee " + stderr + ") 3>&1 1>&2 2>&3"
	crontab_job_string =  "(" + crontab_job_string + ")"

	if (tab.logging && tab.logging == "true") {
		crontab_job_string += "; if test -f " + stderr +
		"; then date >> \"" + log_file + "\"" +
		"; cat " + stderr + " >> \"" + log_file + "\"" +
		"; fi";

		crontab_job_string += "; if test -f " + stdout +
		"; then date >> \"" + log_file_stdout + "\"" +
		"; cat " + stdout + " >> \"" + log_file_stdout + "\"" +
		"; fi";
	}

	if (tab.hook) {
		crontab_job_string += "; if test -f " + stdout +
		"; then " + tab.hook + " < " + stdout +
		"; fi";
	}

	if (tab.mailing && JSON.stringify(tab.mailing) != "{}"){
		crontab_job_string += "; /usr/local/bin/node " + __dirname + "/bin/crontab-ui-mailer.js " + tab._id + " " + stdout + " " + stderr;
	}

	return crontab_job_string;
}

add_env_vars = function(env_vars, command) {
	console.log("env vars");
	console.log(env_vars)
	if (env_vars)
		return "(" + env_vars.replace(/\s*\n\s*/g,' ').trim() + "; (" + command + "))";
	
	return command;
}

// Set actual crontab file from the db
exports.set_crontab = async function(env_vars, callback) {
  await exports.crontabs(async function(tabs){
	var crontab_string = "";
	if (env_vars) {
	  crontab_string += env_vars;
	  crontab_string += "\n";
	}
	tabs.forEach(function(tab){
	  if(!tab.stopped) {
		crontab_string += tab.schedule;
		crontab_string += " ";
		crontab_string += make_command(tab);
		crontab_string += "\n";
	  }
	});
	fs.writeFile(exports.env_file, env_vars, function(err) {
	  if (err) {
		console.error(err);
		callback(err);
	  }
	  var fileName = process.env.CRON_IN_DOCKER !== undefined  ? "root" : "crontab";
	  fs.writeFile(path.join(cronPath, fileName), crontab_string, function(err) {
		if (err) {
		  console.error(err);
		  return callback(err);
		}
		exec("crontab " + path.join(cronPath, fileName), async function(err) {
		  if (err) {
			console.error(err);
			return callback(err);
		  }
		  else {
			await initDB();
			db.data.crontabs.forEach(tab => tab.saved = true);
			await db.write();
			callback();
		  }
		});
	  });
	});
  });
};

exports.get_backup_names = function(){
	var backups = [];
	fs.readdirSync(exports.db_folder).forEach(function(file){
		// file name begins with backup
		if(file.indexOf("backup") === 0){
			backups.push(file);
		}
	});

	let backup_date = (backup_name) => {
		let T = backup_name.split("backup")[1];
		return new Date(T.substring(0, T.length-3)).valueOf();
	}

	backups.sort((a, b) => backup_date(b) - backup_date(a));

	return backups;
};

exports.backup = (callback) => {
	fs.copyFile(exports.crontab_db_file, path.join(exports.db_folder, 'backup ' + (new Date()).toString().replace("+", " ") + '.db'), (err) => {
		if (err) {
			console.error(err);
			return callback(err);
		}
		callback();
	});
};

exports.restore = function(db_name){
  fs.createReadStream(path.join(exports.db_folder, db_name)).pipe(fs.createWriteStream(exports.crontab_db_file));
  // For lowdb, reload is just re-reading the file
  initDB();
};

exports.reload_db = function(){
  initDB();
};

exports.import_crontab = function(){
  exec("crontab -l", async function(error, stdout, stderr){
	var lines = stdout.split("\n");
	var namePrefix = new Date().getTime();
	await initDB();
	for (let index = 0; index < lines.length; index++) {
	  let line = lines[index].replace(/\t+/g, ' ');
	  var regex = /^((\@[a-zA-Z]+\s+)|(([^ -]+)\s+([^ -]+)\s+([^ -]+)\s+([^ -]+)\s+([^ -]+)\s+))/;
	  var command = line.replace(regex, '').trim();
	  var schedule = line.replace(command, '').trim();
	  var is_valid = false;
	  try { is_valid = cron_parser.parseString(line).expressions.length > 0; } catch (e){}
	  if(command && schedule && is_valid){
		var name = namePrefix + '_' + index;
		let doc = db.data.crontabs.find(t => t.command === command && t.schedule === schedule);
		if(!doc){
		  await exports.create_new(name, command, schedule, null);
		}
		else{
		  doc.command = command;
		  doc.schedule = schedule;
		  await exports.update(doc);
		}
	  }
	}
	await db.write();
  });
};

exports.autosave_crontab = function(callback) {
	let env_vars = exports.get_env();
	exports.set_crontab(env_vars, callback);
};
