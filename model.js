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
// ***** start of db stuff *****

var con;

// setup PartyWhip database, !!! REMOVES CURRENT PARTYWHIP DATABASE !!!

initialise_database(create_tables);

function initialise_database(callback) {
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
	});
	setTimeout( function() {
		if (typeof callback == 'function') {
			callback();
		}}, 2000);
}

function create_tables() {
	con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "password",
		database: "PartyWhip"
	});
	basic_query("CREATE TABLE Users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), first_name VARCHAR(255), last_name VARCHAR(255), phone_no VARCHAR(20), email VARCHAR(255))", "created Users table");	
	basic_query("CREATE TABLE Requests (id INT AUTO_INCREMENT PRIMARY KEY, userID INT, date DATE, time TIME, deadline DATE, suburb VARCHAR(255), type VARCHAR(255), noPeople INT, qualityLevel VARCHAR(255), budget FLOAT(10,2), additional_info VARCHAR(255), completed BIT, FOREIGN KEY (userID) REFERENCES Users(id)) ", "created Requests table");
	// not sure if foreign key is set up properly

	basic_query("CREATE TABLE Businesses (id INT AUTO_INCREMENT PRIMARY KEY, userID INT, opening_hours VARCHAR(255), phone_no VARCHAR(20), email VARCHAR(255), description VARCHAR(255), FOREIGN KEY (userID) REFERENCES Users(id))", "created Businesses table");
	// link userID to Users(id)

	basic_query("CREATE TABLE Bids(requestID INT, businessID INT, price FLOAT(10,2), status BIT, FOREIGN KEY (requestID) REFERENCES Requests(id), FOREIGN KEY (businessID) REFERENCES Businesses(id), CONSTRAINT pk PRIMARY KEY(requestID, businessID)) ", "created Bids table");
	// link businessID and reqID to Businesses(id) and Requests(id)
}

function basic_query(sql, message) {	
	con.query(sql, function (err, result) {
		if (err) throw err;
		console.log(message);
	});
//	con.connect(function(err) {
//		if (err) throw err;
//		console.log("Connected!");
//		con.query(sql, function (err, result) {
//			if (err) throw err;
//			console.log(message);
//		});
//	});
}

// ***** end of db stuff *****

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
