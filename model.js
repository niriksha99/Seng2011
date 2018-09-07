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

var mysql = require('mysql');

// setup PartyWhip database, !!! REMOVES CURRENT PARTYWHIP DATABASE !!!
// initialise_database();

/*
initialise_database();

function initialise_database() {
	var initial_con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "password"
	});

	initial_con.connect(function(err) {
		if (err) throw err;
		console.log("initial con Connected!");
		initial_con.query("DROP DATABASE IF EXISTS PartyWhip", function (err, result) {
			if (err) throw err;
			console.log("Old PartyWhip database removed (if it existed)");
		});
		initial_con.query("CREATE DATABASE PartyWhip", function (err, result) {
			if (err) throw err;
			console.log("PartyWhip database created");
		});
		// new con
		var con = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "password",
			database: "PartyWhip"
		});
	
		con.connect(function(err) {
			if (err) throw err;
			console.log("con Connected!");
			con.query("CREATE TABLE Users (id int AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), first_name VARCHAR(255), last_name VARCHAR(255), phone_no VARCHAR(20), email VARCHAR(255))", function (err, result) {
				if (err) throw err;
				console.log("created Users table");
			});
		});
	
		basic_query(con, "CREATE TABLE Users (id int AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), first_name VARCHAR(255), last_name VARCHAR(255), phone_no VARCHAR(20), email VARCHAR(255))", "created Users table");	
	});
}

function basic_query(connection, sql, message) {	
	connection.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		connection.query(sql, function (err, result) {
			if (err) throw err;
			console.log(message);
		});
	});
}

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password",
	database: "PartyWhip"
});
*/
app.get('/', function(req, res){
	if (req.session.valid === undefined) req.session.valid = false;
	if (req.session.error === undefined) req.session.error = false;
	if (req.session.username === undefined) req.session.username = null;
	res.render('homepage.html', {error:req.session.error, login:req.session.username});
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

app.post('/link_business_submit', function(req, res)
{
	var business_name = req.body.business_name;
	var opening_time = req.body.opening_time;
	var phone = req.body.mobile_number;
	var email = req.body.email;
	var business_description = req.body.business_description;
	console.log(business_name);
	console.log(opening_time);
	console.log(phone);
	console.log(email);
	console.log(business_description);

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

app.get('/individual_request', function(req, res)
{
	res.render('individual_request.html');
});

app.get('/individual_bid', function(req, res)
{
	res.render('individual_bid.html');
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

app.get('/individual_business', function(req, res)
{
	res.render('business.html');
});

app.get('/my_bids', function(req, res)
{
	res.render('my_bids.html');
	//res.sendFile(path.join(__dirname+'/my_bids.html'));
});

app.get('/accepted_bids', function(req, res)
{
	res.render('accepted_bids.html');
});

app.get('/catering_requests', function(req, res)
{
	res.render('catering_requests.html');
});

app.get('/signout', function(req, res)
{
	req.session.username = null;
	req.session.valid = false;
	req.session.error = false;
	res.redirect('/');
});

var server = app.listen(8000, function() {});

console.log('http://localhost:8000')
