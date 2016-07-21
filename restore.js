//load database
var Datastore = require('nedb');

var exec = require('child_process').exec;
var fs = require('fs');
var tmp = require('tmp');

exports.loadBackupFile = function(db_name, callback) {

  console.log(__dirname + '/crontabs/' + db_name);

  var backupFileData = fs.readFileSync(__dirname + '/crontabs/' + db_name).toString('utf8');
  console.log(backupFileData);
  var data = JSON.parse(backupFileData);


  var crontabFile = tmp.fileSync();
  var templateFile = tmp.fileSync();

  fs.writeFileSync(crontabFile.name, data.crontabs);
  fs.writeFileSync(templateFile.name, data.templates);

  var crontabDB = new Datastore({ filename: crontabFile.name , autoload: true });
  var templateDB = new Datastore({ filename: templateFile.name , autoload: true });

  crontabDB.find({}).sort({ created: -1 }).exec(function(err, docs){
    templateDB.find({}).sort({ name: 1 }).exec(function(err, templates) {

      callback(docs, templates);
    })
  });

};

exports.delete = function(db_name){
	fs.unlink(__dirname + '/crontabs/' + db_name);
}

