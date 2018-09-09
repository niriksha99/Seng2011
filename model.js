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

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password",
	database: "PartyWhip"
});

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

app.post('/post_request', login_required, function(req, res)
{
	var event_date = req.body.date;
	var event_time = req.body.time;
	var deadline = req.body.deadline;
	var event_suburb = req.body.suburb;
	var event_type = req.body.type;
	var num_ppl = req.body.no_people;
	var quality = req.body.quality;
	var budget = req.body.budget;
	var choice = req.body.legendRadio;
	var add_info = req.body.additional_info;
	var completed = 0;

	con.query('SELECT * FROM Users WHERE username = ?', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		var request = {
			userID: result[0].id,
			date: event_date,
			time: event_time,
			deadline: deadline,
			suburb: event_suburb,
			type: event_type,
			noPeople: num_ppl,
			qualityLevel: quality,
			budget: budget,
			choice: choice,
			additional_info: add_info,
			completed: completed
		};
		console.log(request);
		con.query('INSERT INTO Requests SET ?', request, function(err, result) {
			if (err) throw err;
			console.log('Inserted: ', res.insertId);
		});
	});

	con.query('SELECT * FROM Requests', function(err,rows) {
	  if (err) throw err;
	  console.log(rows);
	});

	//req.session.business_name = business_name;
	return res.redirect("/individual_request");
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
