var express = require('express');
var app = express();
var crontab = require("./crontab");

// include the routes
var routes = require("./routes").routes;

// set the view engine to ejs
app.set('view engine', 'ejs');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// include all folders
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));

//set port
app.set('port', (process.env.PORT || 8000));

app.get(routes.root, function(req, res) {
	// get all the crontabs
	//crontab.create_new("/usr/bin/find", "0        2          12             *                *");
	//crontab.create_new("/sbin/ping -c 1 192.168.0.1 > /dev/null", "*       *       *       *       *");
	crontab.crontabs( function(docs){
		res.render('index', {
			routes : routes,
			crontabs : JSON.stringify(docs)
		});
	});
})

app.post(routes.save, function(req, res) {
	// new job
	if(req.body._id == -1){
		crontab.create_new(req.body.name, req.body.command, req.body.schedule);
	}
	// edit job
	else{
		crontab.update(req.body);
	}
	res.end();
})

app.listen(app.get('port'), function() {
  console.log("Crontab UI is running at localhost:" + app.get('port'))
})
