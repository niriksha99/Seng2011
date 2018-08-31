var express = require('express');
var session = require('express-session');
var app = express();

app.use(session({secret: 'P1n3@pp7ePizz4'}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', './templates');
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'js')));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
	var valid = req.session.valid;
	req.session.valid = null;
	res.render('homepage.html', {error:valid});
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
		res.redirect('/user');
	} else {
		req.session.valid = true;
		res.redirect('/');
	}
});

app.get('/home', function(req, res)
{
	res.render('homepage.html');
});

app.get('/user', function(req, res)
{
	if (req.session.username !== null) {
		res.render('user_homepage.html', {user:req.session.username});
	}
});

app.get('/requests', function(req, res)
{
	res.render('my_requests.html');
});

app.get('/make_requests', function(req, res)
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
	res.redirect('/');
});

var server = app.listen(3000, function() {});

console.log('http://localhost:3000')