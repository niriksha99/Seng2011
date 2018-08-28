var express = require('express');
var app = express();
//app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) 
{
	res.render('home.html');
});

app.post('/', function(req, res) 
{
	res.render('welcome.html');
});


app.get('/dashboard', function(req, res) 
{
	res.render('dashboard.html');
});

app.post('/welcome', function(req, res) 
{
	var name = req.body.name;
	console.log(name);
	res.render('welcome.html', {name:name});
});


var server = app.listen(3000, function() {});
