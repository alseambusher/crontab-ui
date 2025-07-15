//load database
const { Low, JSONFile } = require('lowdb');
var crontab = require("./crontab");
var path = require("path");

var exec = require('child_process').exec;
var fs = require('fs');

exports.crontabs = async function(db_name, callback){
  const adapter = new JSONFile(path.join(crontab.db_folder, db_name));
  const db = new Low(adapter);
  await db.read();
  db.data = db.data || { crontabs: [] };
  let docs = db.data.crontabs.slice().sort((a, b) => b.created - a.created);
  callback(docs);
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
