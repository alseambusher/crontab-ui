var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// include all folders
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.set('port', (process.env.PORT || 8000));

app.get('/', function(req, res) {
  res.render('index');
  //res.sendFile('index.htm');
})

app.listen(app.get('port'), function() {
  console.log("Crontab UI is running at localhost:" + app.get('port'))
})
