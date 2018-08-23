var express = require('express');
var app = express();
app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) 
{
	res.render('home.ejs');
});

app.post('/', function(req, res) 
{
	res.render('welcome.ejs');
});


app.get('/dashboard', function(req, res) 
{
	res.render('dashboard.ejs');
});

app.post('/welcome', function(req, res) 
{
	var name = req.body.name;
	console.log(name);
	res.render('welcome.ejs', {name:name});
});


var server = app.listen(3000, function() {});
