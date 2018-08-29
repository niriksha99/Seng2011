var express = require('express');
var app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', './views');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) 
{
	res.render('home.html');
});

app.post('/', function(req, res) {
	var id = req.body.username;
	var pass = req.body.password;
	var email = req.body.email;
	console.log(id)
	console.log(pass)
	console.log(email)
	res.render('home.html');
});

/*
app.post('/', function(req, res) 
{
	res.render('welcome.html');
});
*/

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
/*
var id;
var pass;
var email;
*/
app.get('/signup', function(req, res) 
{
	res.render('sign-up-form.html');
});

var server = app.listen(3000, function() {});

console.log('http://localhost:3000')