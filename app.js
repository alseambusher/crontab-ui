/*jshint esversion: 6*/
var express = require('express');
var app = express();
var crontab = require("./crontab");
var restore = require("./restore");
var moment = require('moment');
var basicAuth = require('express-basic-auth');

var path = require('path');
var mime = require('mime-types');
var fs = require('fs');
var busboy = require('connect-busboy'); // for file upload

// basic auth
var BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
var BASIC_AUTH_PWD = process.env.BASIC_AUTH_PWD;

if (BASIC_AUTH_USER && BASIC_AUTH_PWD) {
    app.use(function(req, res, next) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"')
        next();
    });

	app.use(basicAuth({
        users: {
            [BASIC_AUTH_USER]: BASIC_AUTH_PWD
        }
    }))
}

// include the routes
var routes = require("./routes").routes;
var routes_relative = require("./routes").relative

// set the view engine to ejs
app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(busboy()); // to support file uploads

// include all folders
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/config'));
app.set('views', __dirname + '/views');

// set host to 127.0.0.1 or the value set by environment var HOST
app.set('host', (process.env.HOST || '127.0.0.1'));

// set port to 8000 or the value set by environment var PORT
app.set('port', (process.env.PORT || 8000));

// root page handler
app.get(routes.root, function(req, res) {
  // reload the database before rendering
	crontab.reload_db();
	// send all the required parameters
	crontab.crontabs( function(docs){
		res.render('index', {
			routes : JSON.stringify(routes_relative),
			crontabs : JSON.stringify(docs),
			backups : crontab.get_backup_names(),
			env : crontab.get_env(),
      moment: moment
		});
	});
});

/*
Handle to save crontab to database
If it is a new job @param _id is set to -1
@param name, command, schedule, logging has to be sent with _id (if exists)
*/
app.post(routes.save, function(req, res) {
	// new job
	if(req.body._id == -1){
		crontab.create_new(req.body.name, req.body.command, req.body.schedule, req.body.logging, req.body.mailing);
	}
	// edit job
	else{
		crontab.update(req.body);
	}
	res.end();
});

// set stop to job
app.post(routes.stop, function(req, res) {
	crontab.status(req.body._id, true);
	res.end();
});

// set start to job
app.post(routes.start, function(req, res) {
	crontab.status(req.body._id, false);
	res.end();
});

// remove a job
app.post(routes.remove, function(req, res) {
	crontab.remove(req.body._id);
	res.end();
});

// run a job
app.post(routes.run, function(req, res) {
	crontab.runjob(req.body._id);
	res.end();
});

// set crontab. Needs env_vars to be passed
app.get(routes.crontab, function(req, res, next) {
	crontab.set_crontab(req.query.env_vars, function(err) {
		if (err) next(err);
		else res.end();
	});
});

// backup crontab db
app.get(routes.backup, function(req, res) {
	crontab.backup();
	res.end();
});

// This renders the restore page similar to backup page
app.get(routes.restore, function(req, res) {
	// get all the crontabs
	restore.crontabs(req.query.db, function(docs){
		res.render('restore', {
			routes : JSON.stringify(routes_relative),
			crontabs : JSON.stringify(docs),
			backups : crontab.get_backup_names(),
			db: req.query.db
		});
	});
});

// delete backup db
app.get(routes.delete_backup, function(req, res) {
	restore.delete(req.query.db);
	res.end();
});

// restore from backup db
app.get(routes.restore_backup, function(req, res) {
	crontab.restore(req.query.db);
	res.end();
});

// export current crontab db so that user can download it
app.get(routes.export, function(req, res) {
	var file = crontab.crontab_db_file;

	var filename = path.basename(file);
	var mimetype = mime.lookup(file);

	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	res.setHeader('Content-type', mimetype);

	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
});

// import from exported crontab db
app.post(routes.import, function(req, res) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		fstream = fs.createWriteStream(crontab.crontab_db_file);
		file.pipe(fstream);
		fstream.on('close', function () {
			crontab.reload_db();
			res.redirect(routes.root);
		});
	});
});

// import from current ACTUALL crontab
app.get(routes.import_crontab, function(req, res) {
	crontab.import_crontab();
	res.end();
});

function sendLog(path, req, res) {
	if (fs.existsSync(path))
		res.sendFile(path);
	else
		res.end("No errors logged yet");
}

// get the log file a given job. id passed as query param
app.get(routes.logger, function(req, res) {
	let _file = crontab.log_folder + "/" + req.query.id + ".log";
	sendLog(_file, req, res);
});

// get the log file a given job. id passed as query param
app.get(routes.stdout, function(req, res) {
	let _file = crontab.log_folder + "/" + req.query.id + ".stdout.log";
	sendLog(_file, req, res);
});

// error handler
app.use(function(err, req, res, next) {
	var data = {};
	var statusCode = err.statusCode || 500;

	data.message = err.message || 'Internal Server Error';

	if (process.env.NODE_ENV === 'development' && err.stack) {
		data.stack = err.stack;
	}

	if (statusCode >= 500) {
		console.error(err);
	}

	res.status(statusCode).json(data);
});

process.on('SIGINT', function() {
  console.log("Exiting crontab-ui");
  process.exit();
})

process.on('SIGTERM', function() {
  console.log("Exiting crontab-ui");
  process.exit();
})

app.listen(app.get('port'), app.get('host'), function() {
  console.log("Node version:", process.versions.node);
  fs.access(crontab.db_folder, fs.W_OK, function(err) {
    if(err){
      console.error("Write access to", crontab.db_folder, "DENIED.");
      process.exit(1);
    }
  });
  // If --autosave is used then we will also save whatever is in the db automatically without having to mention it explictly
  // we do this by watching log file and setting a on change hook to it
  if (process.argv.includes("--autosave")){
    crontab.autosave_crontab(()=>{});
    fs.watchFile(crontab.crontab_db_file, () => {
      crontab.autosave_crontab(()=>{
        console.log("Attempted to autosave crontab");
      });
    });
  }
  if (process.argv.includes("--reset")){
    console.log("Resetting crontab-ui");
    var crontabdb = crontab.crontab_db_file;
    var envdb = crontab.env_file;

    console.log("Deleting " + crontabdb);
    try{
      fs.unlinkSync(crontabdb);
    } catch (e) {
      console.log("Unable to delete " + crontabdb);
    }

    console.log("Deleting " + envdb);
    try{
      fs.unlinkSync(envdb);
    } catch (e) {
      console.log("Unable to delete " + envdb);
    }

    crontab.reload_db();
  }
	console.log("Crontab UI is running at http://" + app.get('host') + ":" + app.get('port'));
});
