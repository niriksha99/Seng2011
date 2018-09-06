var express = require('express');
var session = require('express-session');
var mysql = require('mysql');
var app = express();

app.use(session({secret: 'P1n3@pp7ePizz4', saveUninitialized: true, resave: true}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', './templates');
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'js')));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'database',
});

con.connect((err) => {
	if (err) {
		console.log("Can't connect to database");
		return;
	}

	console.log("Connection established!");
});

app.get('/', function(req, res){
	if (req.session.valid === undefined) req.session.valid = false;
	if (req.session.error === undefined) req.session.error = false;
	if (req.session.username === undefined) req.session.username = null;
	res.render('homepage.html', {error: req.session.error, login: req.session.username});
});

app.get('/signup', function(req, res) 
{
	res.render('sign_up.html');
});

app.post('/signup_submit', function(req, res)
{
	var first = req.body.first_name;
	var last = req.body.last_name;
	var id = req.body.username;
	var pass = req.body.password;
	var repass = req.body.repassword;
	var phone = req.body.mobile_number;
	var email = req.body.email;
	console.log(first);
	console.log(last);
	console.log(id);
	console.log(pass);
	console.log(repass);
	console.log(phone);
	console.log(email);
	
	return res.redirect("/");
});

app.post('/login', function(req, res)
{
	var id = req.body.username;
	var ps = req.body.password;
	console.log(id);
	console.log(ps);
	if (id === "admin" && ps === "password") {
		req.session.username = id;
		req.session.valid = true;
		req.session.error = false;
		res.redirect('/user');
	} else {
		req.session.error = true;
		res.redirect('/');
	}
});

app.get('/home', function(req, res)
{
	if (req.session.username !== null) {
		res.render('homepage.html', {error: req.session.error, login: req.session.username});
	} else {
		res.redirect('/');
	}
});

app.get('/user', function(req, res)
{
	if (req.session.username !== null) {
		res.render('user_homepage.html', {user: req.session.username});
	} else {
		res.redirect('/');
	}
});

app.get('/requests', function(req, res)
{
	res.render('my_requests.html');
});

app.get('/make_request', function(req, res)
{
	res.render('request_form.html');
});

app.get('/link_business', function(req, res)
{
	res.render('link_business.html');
});

app.get('/business', function(req, res)
{
	res.render('my_businesses.html');
});

app.get('/signout', function(req, res)
{
	req.session.username = null;
	req.session.valid = false;
	req.session.error = false;
	res.redirect('/');
});

app.post('/apply_business', function(req, res)
{
	//
	res.redirect('/business');
});

app.post('/post_request', function(req, res)
{
	//
	res.redirect('/requests');
});

var server = app.listen(3000, function() {});

console.log('http://localhost:3000')