var express = require('express');
var app = express();
var crontab = require("./crontab");

// include the routes
var routes = require("./routes").routes;

// set the view engine to ejs
app.set('view engine', 'ejs');

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
		console.log(docs);
		res.render('index', {
			routes : routes,
			crontabs : JSON.stringify(docs)
		});
	});
})

app.get(routes.save, function(req, res) {
	res.render('index');
})

app.listen(app.get('port'), function() {
  console.log("Crontab UI is running at localhost:" + app.get('port'))
})
