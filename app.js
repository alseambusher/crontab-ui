var express = require('express');
var app = express();
var crontab = require("./crontab");
var restore = require("./restore");

var moment = require('moment');
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var busboy = require('connect-busboy'); // for file upload


// include the routes
var routes = require("./routes").routes;

// set the view engine to ejs
app.set('view engine', 'ejs');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(busboy()) // to support file uploads

// include all folders
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.set('views', __dirname + '/views');

//set port
app.set('port', (process.env.PORT || 8000));
app.set('listen', (process.env.LISTEN || '0.0.0.0'));

app.get(routes.root, function(req, res) {
	// get all the crontabs
	crontab.reload_db();
	crontab.crontabs( function(docs){
		crontab.templates(function(templates) {
			res.render('index', {
				routes : JSON.stringify(routes),
				crontabs : JSON.stringify(docs),
				templates: templates,
				templatesById: templates.reduce(function(memo, t) {
					memo[t._id] = t;
					return memo;
				}, {}),
				backups : crontab.get_backup_names(),
				env : crontab.get_env(),
				moment: moment,
			});
		});
	});
})

app.post(routes.save, function(req, res) {
	// new job
	if(req.body._id == -1){
		crontab.create_new(req.body.name, req.body.command, req.body.command_template, req.body.vars, req.body.schedule, req.body.logging);
	}
	// edit job
	else{

		crontab.update(req.body);
	}
	res.end();
})

app.post(routes.save_template, function(req, res) {
	// new job
	if(req.body._id == -1){
		crontab.create_new_template(req.body.name, req.body.command, req.body.schedule);
	}
	// edit job
	else{
		crontab.update_template(req.body);
	}
	res.end();
});

app.post(routes.remove_template, function(req, res) {
	crontab.remove_template(req.body._id);
	res.end();
})

app.post(routes.stop, function(req, res) {
	crontab.status(req.body._id, true);
	res.end();
})

app.post(routes.start, function(req, res) {
	crontab.status(req.body._id, false);
	res.end();
})

app.post(routes.remove, function(req, res) {
	crontab.remove(req.body._id);
	res.end();
})
app.get(routes.crontab, function(req, res) {
	crontab.set_crontab(req.query.env_vars);
	res.end();
})

app.get(routes.backup, function(req, res) {
	crontab.backup();
	res.end();
})

app.get(routes.restore, function(req, res) {
	// get all the crontabs
	restore.loadBackupFile(req.query.db, function(docs, templates) {
		res.render('restore', {
			routes : JSON.stringify(routes),
			crontabs : JSON.stringify(docs),
			templates: templates,
			templatesById: templates.reduce(function(memo, t) {
				memo[t._id] = t;
				return memo;
			}, {}),
			backups : crontab.get_backup_names(),
			env : crontab.get_env(),
			moment: moment,
			db: req.query.db
		});
	});
})

app.get(routes.delete_backup, function(req, res) {
	restore.delete(req.query.db);
	res.end();
})

app.get(routes.restore_backup, function(req, res) {
	crontab.restore(req.query.db);
	res.end();
})

app.get(routes.export, function(req, res) {
	var backupData = crontab.backup_data();

	res.setHeader('Content-disposition', 'attachment; filename=crontab_ui_backup.json');
	res.setHeader('Content-type', 'application/json');

	res.end(JSON.stringify(backupData));
});


app.post(routes.import, function(req, res) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {

		file.on('data', function(data) {
			crontab.restore_data(JSON.parse(data.toString('utf8')));
			crontab.reload_db();
		});
	});

	req.busboy.on('finish', function() {
		res.redirect(routes.root);
	})
});

app.get(routes.import_crontab, function(req, res) {
	crontab.import_crontab()
	res.end();
})

app.get(routes.logger, function(req, res) {
	var fs = require("fs");
	_file = crontab.log_folder +"/"+req.query.id+".log";
	if (fs.existsSync(_file))
		res.sendFile(_file);
	else
		res.end("No errors logged yet");
})

// app.use('/scripts/moment.js', express.static(__dirname + '/node_modules/moment/min/moment.min.js'));

app.listen(app.get('port'), app.get('listen'), function() {
  	console.log("Crontab UI is running at " + app.get('listen') + ":" + app.get('port'))
})
