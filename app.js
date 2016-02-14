var express = require('express');
var app = express();
var crontab = require("./crontab");
var restore = require("./restore");

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

app.get(routes.root, function(req, res) {
	// get all the crontabs
	crontab.crontabs( function(docs){
		res.render('index', {
			routes : JSON.stringify(routes),
			crontabs : JSON.stringify(docs),
			backups : crontab.get_backup_names(),
			env : crontab.get_env()
		});
	});
})

app.post(routes.save, function(req, res) {
	// new job
	if(req.body._id == -1){
		crontab.create_new(req.body.name, req.body.command, req.body.schedule, req.body.logging);
	}
	// edit job
	else{
		crontab.update(req.body);
	}
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
	restore.crontabs(req.query.db, function(docs){
		res.render('restore', {
			routes : JSON.stringify(routes),
			crontabs : JSON.stringify(docs),
			backups : crontab.get_backup_names(),
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
	var file = __dirname + '/crontabs/crontab.db';

	var filename = path.basename(file);
	var mimetype = mime.lookup(file);

	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	res.setHeader('Content-type', mimetype);

	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
})


app.post(routes.import, function(req, res) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		fstream = fs.createWriteStream(__dirname + '/crontabs/crontab.db');
		file.pipe(fstream);
		fstream.on('close', function () {
			crontab.reload_db();
			res.redirect(routes.root);
        	});
    	});
})

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

app.listen(app.get('port'), function() {
  	console.log("Crontab UI is running at localhost:" + app.get('port'))
})
