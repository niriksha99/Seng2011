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

// ***** start of db stuff *****

var con;

// setup PartyWhip database, !!! REMOVES CURRENT PARTYWHIP DATABASE !!!

initialise_database(create_tables);

function initialise_database(callback) {
	var initial_con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "database"
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
		password: "database",
		database: "PartyWhip"
	});
	basic_query("CREATE TABLE Users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), first_name VARCHAR(255), last_name VARCHAR(255), phone_no VARCHAR(20), email VARCHAR(255))", "created Users table");	
	basic_query("CREATE TABLE Requests (id INT AUTO_INCREMENT PRIMARY KEY, userID INT, date DATE, time TIME, deadline DATE, suburb VARCHAR(255), type VARCHAR(255), noPeople INT, qualityLevel VARCHAR(255), budget FLOAT(10,2), additional_info VARCHAR(255), completed BIT, FOREIGN KEY (userID) REFERENCES Users(id)) ", "created Requests table");
	// not sure if foreign key is set up properly

	basic_query("CREATE TABLE Businesses (id INT AUTO_INCREMENT PRIMARY KEY, userID INT, title VARCHAR(255), opening_hours VARCHAR(255), phone_no VARCHAR(20), email VARCHAR(255), description VARCHAR(255), FOREIGN KEY (userID) REFERENCES Users(id))", "created Businesses table");
	// link userID to Users(id)

	basic_query("CREATE TABLE Bids(requestID INT, businessID INT, price FLOAT(10,2), status BIT, FOREIGN KEY (requestID) REFERENCES Requests(id), FOREIGN KEY (businessID) REFERENCES Businesses(id), CONSTRAINT pk PRIMARY KEY(requestID, businessID)) ", "created Bids table");
	// link businessID and reqID to Businesses(id) and Requests(id)

	// add basic admin credentials
	basic_query("INSERT INTO Users (username, password) VALUES ('admin', 'pass')", "add admin login");
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

function login_required(req, res, next) {
	if (!req.session.username) {
		res.redirect('/error');
	} else {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		next();
	}
}

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

	var signup_user = {
		username: id,
		password: pass,
		first_name: first,
		last_name: last,
		phone_no: phone,
		email: email
	};

	// insert new user (haven't checked if user exists)
	con.query('INSERT INTO Users SET ?', signup_user, function(err, res) {
		if (err) throw err;
		console.log('Inserted: ', res.insertId);
	});

	// print all users, testing purpose
	con.query('SELECT * FROM Users', function(err,rows) {
	  if (err) throw err;
	  console.log(rows);
	});

	return res.redirect("/");
});

app.post('/link_business_submit', login_required, function(req, res)
{
	var business_name = req.body.business_name;
	var opening_time = req.body.opening_time;
	var phone = req.body.phone;
	var email = req.body.email;
	var business_description = req.body.business_description;
	// console.log(business_name);
	// console.log(opening_time);
	// console.log(phone);
	// console.log(email);
	// console.log(business_description);
	con.query('SELECT * FROM Users WHERE username = ?', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		var business = {
			userID: result[0].id,
			title: business_name,
			opening_hours: opening_time,
			phone_no: phone,
			email: email,
			description: business_description
		};
		console.log(business);
		con.query('INSERT INTO Businesses SET ?', business, function(err, result) {
			if (err) throw err;
			console.log('Inserted: ', res.insertId);
		});
	});

	con.query('SELECT * FROM Businesses', function(err,rows) {
	  if (err) throw err;
	  console.log(rows);
	});

	req.session.business_name = business_name;
	return res.redirect("/individual_business");
});

app.post('/login', function(req, res)
{
	var id = req.body.username;
	var ps = req.body.password;

	// OR we can fetch all users and search/check credential ourselves?
	con.query('SELECT * FROM Users WHERE username = ?', [id], function(err, result, fields) {
		if (err) throw err;
		if (result[0].password === ps) {
			req.session.username = id;
			req.session.valid = true;
			req.session.error = false;
			res.redirect('/user');
		} else {
			req.session.error = true;
			res.redirect('/');
		}
	});
});

app.get('/home', function(req, res)
{
	if (req.session.username !== null) {
		res.render('homepage.html', {error: req.session.error, login: req.session.username});
	} else {
		res.redirect('/');
	}
});

app.get('/user', login_required, function(req, res)
{
	res.render('user_homepage.html', {user: req.session.username});
});

app.get('/requests', login_required, function(req, res)
{
	res.render('my_requests.html');
});

app.get('/individual_request', login_required, function(req, res)
{
	res.render('individual_request.html');
});

app.get('/individual_bid', login_required, function(req, res)
{
	res.render('individual_bid.html');
});

app.get('/make_request', login_required, function(req, res)
{
	res.render('request_form.html', {user: req.session.username});
});

app.get('/link_business', login_required, function(req, res)
{
	res.render('link_business.html');
});

app.get('/business', login_required, function(req, res)
{
	res.render('my_businesses.html');
});

app.get('/individual_business', login_required, function(req, res)
{
	res.render('business.html', {business_name: req.session.business_name});
});

app.get('/my_bids', login_required, function(req, res)
{
	res.render('my_bids.html');
	//res.sendFile(path.join(__dirname+'/my_bids.html'));
});

app.get('/accepted_bids', login_required, function(req, res)
{
	res.render('accepted_bids.html', {login: req.session.username});
});

app.get('/catering_requests', login_required, function(req, res)
{
	res.render('catering_requests.html');
});

app.get('/signout', login_required, function(req, res)
{
	//req.session.username = null;
	//req.session.valid = false;
	//req.session.error = false;
	delete req.session.username;
	delete req.session.valid;
	delete req.session.business_name;
	res.redirect('/');
});

app.get('/error', function(req, res)
{
	res.status(404);
	res.send('NOT FOUND');
});

var server = app.listen(8000, function() {});
console.log('http://localhost:8000')
