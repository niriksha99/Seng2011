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
	if (req.session.userid === undefined) req.session.userid = null;
	res.render('homepage.html', {error: req.session.error, login: req.session.username});
});

app.get('/signup', function(req, res)
{
	res.render('sign_up.html');
});

app.post('/signup_submit', function(req, res)
{
	delete req.session.error;
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
	var business;
	con.query('SELECT * FROM Users WHERE username = ?', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		business = {
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

	setTimeout(function () {
		con.query('SELECT * FROM Businesses', function(err,rows) {
		  if (err) throw err;
		  console.log(rows);
		});
	}, 3000);

	req.session.business = {
			business_name: business_name,
			opening_time: opening_time,
			phone: phone,
			email: email,
			business_description: business_description
	};
	return res.redirect("/individual_business");
});

app.post('/post_request', login_required, function(req, res)
{
	var event_name = req.body.event_name;
	var event_date = req.body.event_date;
	var event_time = req.body.event_time;
	var event_deadline = req.body.event_deadline;
	var event_suburb = req.body.event_suburb;
	var event_type = req.body.event_type;
	var noPeople = req.body.noPeople;
	var qualityLevel = req.body.qualityLevel;
	var budget = req.body.budget;
	var choice = req.body.legendRadio;
	var additional_info = req.body.additional_info;
	var completed = 0;
	var request;

	con.query('SELECT * FROM Users WHERE username = ?', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		request = {
			userID: result[0].id,
			event_name: event_name,
			event_date: event_date,
			event_time: event_time,
			event_deadline: event_deadline,
			event_suburb: event_suburb,
			event_type: event_type,
			noPeople: noPeople,
			qualityLevel: qualityLevel,
			budget: budget,
			choice: choice,
			additional_info: additional_info,
			completed: completed
		};
		console.log(request);
		con.query('INSERT INTO Requests SET ?', request, function(err, result) {
			if (err) throw err;
			console.log('Inserted: ', res.insertId);
		});
	});

	setTimeout(function () {
		con.query('SELECT * FROM Requests', function(err,rows) {
		  if (err) throw err;
		  console.log(rows);
		});
	}, 3000);

	req.session.request = {
			owner: req.session.userid,
			event_name: event_name,
			event_date: event_date,
			event_time: event_time,
			event_deadline: event_deadline,
			event_suburb: event_suburb,
			event_type: event_type,
			noPeople: noPeople,
			qualityLevel: qualityLevel,
			budget: budget,
			choice: choice,
			additional_info: additional_info,
			completed: completed
		};

	//req.session.business_name = business_name;
	return res.redirect("/individual_request_user");
});

app.get('/catering_requests', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests', function(err, result, fields){
		if (err) throw err;
		var requests = [];
		for (var i = 0; i < result.length; i++) {
			requests.push(result[i].event_name);
		}
		res.render('catering_requests.html', {request_list: requests});
	});
});

app.get('/individual_request', login_required, function(req, res)
{
	console.log(req.session.event_name);
	res.render('individual_request.html', {request: req.session.request});
});

app.post('/individual_request', function(req, res)
{
		con.query('SELECT * FROM Requests WHERE event_name = ?', [req.body.event_name], function(err, result, fields) {
			if(err) throw err;
			var request = {
				event_name: result[0].event_name,
				event_date: result[0].event_date,
				event_time: result[0].event_time,
				event_deadline: result[0].event_deadline,
				event_suburb: result[0].event_suburb,
				event_type: result[0].event_type,
				noPeople: result[0].noPeople,
				budget: result[0].budget,
				qualityLevel: result[0].qualityLevel,
				choice: result[0].choice,
				additional_info: result[0].additional_info
			};
			res.render('individual_request.html', {request: request});
	});
});

app.get('/delete_request', function(req, res)
{
	console.log(req.body.event_name);
	con.query('DELETE FROM Requests WHERE event_name = ?', [req.body.event_name], function(err, result) {
	//con.query('DELETE FROM Requests WHERE event_name = ?', ['bye'], function(err, result) {
		if (err) throw err;
		console.log("Record deleted");
		return res.redirect('/user');
	});

});

app.post('/login', function(req, res)
{
	var id = req.body.username;
	var ps = req.body.password;

	// OR we can fetch all users and search/check credential ourselves?
	con.query('SELECT * FROM Users WHERE username = ?', [id], function(err, result, fields) {
		if (err) throw err;
		if (result.length <= 0) {
			req.session.error = true;
			res.redirect('/');
		}
		else if (result[0].password === ps) {
			req.session.username = id;
			req.session.userid = result[0].id;
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

app.post('/search', function(req, res){

	var search = req.body.search;

  con.query('SELECT * FROM Businesses WHERE title = ?', [search], function(err, rows, fields) {
    if(err) throw err;
    var data = [];
    for(i=0;i<rows.length;i++){
      data.push(rows[i].title);
    }
    res.end(JSON.stringify(data));
    console.log(req.params.input);
  });

});


app.get('/user', login_required, function(req, res)
{
	var search = req.session.username;
	con.query('SELECT * FROM Users WHERE username = ?', [search], function(err, rows, fields) {
		if(err) throw err;
		var a = [];
		var b = [];
		var c = [];
		var d = [];
		var e = [];
		for(i=0;i<rows.length;i++){
      a.push(rows[i].first_name);
			b.push(rows[i].last_name);
			c.push(rows[i].password);
			d.push(rows[i].phone_no);
			e.push(rows[i].email);
    }
		res.render('user_homepage.html', {user: req.session.username, f_n: a, l_n: b, p: c, p_n: d, e_a: e});
	});

});

app.get('/requests', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE userID = (SELECT id FROM Users WHERE username = ?)', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		var requests = [];
		for (var i = 0; i < result.length; i++) {
			requests.push(result[i].event_name);
		}
		res.render('my_requests.html', {request_list: requests});
	});
});

// app.post('/individual_request', login_required, function(req, res)
// {
// 	//select Requests.*, Businesses.* from Requests right join Businesses on event_name = 'death from assignment'
// 	con.query('SELECT * FROM Requests WHERE event_name = ?', [req.body.request_name], function(err, result, fields) {
// 		if (err) throw err;
// 		var request = {
// 			event_name: result[0].event_name,
// 			event_date: result[0].event_date,
// 			event_time: result[0].event_time,
// 			event_deadline: result[0].event_deadline,
// 			event_suburb: result[0].event_suburb,
// 			event_type: result[0].event_type,
// 			noPeople: result[0].noPeople,
// 			qualityLevel: result[0].qualityLevel,
// 			budget: result[0].budget,
// 			choice: result[0].choice,
// 			additional_info: result[0].additional_info
// 		};
// 		res.render('individual_request.html', {request: request});
// 	});
// });

app.get('/individual_bid', login_required, function(req, res)
{
	res.render('individual_bid.html');
});

app.post('/individual_bid', login_required, function(req, res)
{
	//select Requests.*, Businesses.* from Requests right join Businesses on event_name = 'death from assignment'
	con.query('SELECT Requests.*, Bids.* FROM Requests LEFT JOIN Bids ON Requests.id = Bids.requestID WHERE Requests.event_name = ?', [req.body.event_name], function(err, result, fields) {
		if (err) throw err;
		var bid_info = {
			event_name: result[0].event_name,
			event_date: result[0].event_date,
			event_time: result[0].event_time,
			event_deadline: result[0].event_deadline,
			event_suburb: result[0].event_suburb,
			event_type: result[0].event_type,
			noPeople: result[0].noPeople,
			qualityLevel: result[0].qualityLevel,
			budget: result[0].budget,
			choice: result[0].choice,
			additional_info: result[0].additional_info,
			amount: result[0].price,
			comment: result[0].comment,
			status: result[0].status
		};
		console.log(bid_info.status + "-" + result[0].status);
		res.render('individual_bid.html', {bid: bid_info});
	});
});

app.get('/individual_request_user', login_required, function(req, res)
{
	console.log(req.session.event_name);
	// var owner = true;
	// var bidder = !owner;
	res.render('individual_request_user.html', {request: req.session.request});//, owner: owner, bidder: bidder});
});

app.post('/individual_request_user', function(req, res)
{
	con.query('SELECT * FROM Requests WHERE event_name = ?', [req.body.event_name], function(err, result, fields) {
	// var search = req.session.username;
	// var owner = true;
	// var bidder = !owner;
	//con.query('SELECT * FROM Requests WHERE userID = (SELECT id FROM Users WHERE username = ?)', [search], function(err, result, fields) {
		if(err) throw err;
		var request = {
			event_name: result[0].event_name,
			event_date: result[0].event_date,
			event_time: result[0].event_time,
			event_deadline: result[0].event_deadline,
			event_suburb: result[0].event_suburb,
			event_type: result[0].event_type,
			noPeople: result[0].noPeople,
			budget: result[0].budget,
			qualityLevel: result[0].qualityLevel,
			budget: result[0].budget,
			choice: result[0].choice,
			additional_info: result[0].additional_info
		};
		res.render('individual_request_user.html', {request: request});
		//res.render('individual_request_user.html', {request: request, owner: owner, bidder: bidder});
	});
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
	con.query('SELECT * FROM Businesses WHERE userID = (SELECT id FROM Users WHERE username = ?)', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		var businesses = [];
		for (var i = 0; i < result.length; i++) {
			businesses.push(result[i].title);
		}
		res.render('my_businesses.html', {business_list: businesses});
	});
});

app.post('/bidding', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE event_name = ?', [req.body.event_name], function(err, result, fields) {
		if (err) throw err;
		var bid = {
			requestID: result[0].id,
			businessID: req.session.businessid,
			price: req.body.price,
			comment: req.body.additional_info,
			status: 1
		};
		con.query('INSERT INTO Bids SET ?', bid, function(err, result) {
			if (err) throw err;
			console.log('Inserted: ', res.insertId);
		});
	});

	con.query('SELECT * FROM Businesses WHERE id = ?', [req.session.businessid], function(err, result, fields) {
		if (err) throw err;
		req.session.business_name = result[0].title;
		req.session.business = {
			business_name: result[0].title,
			opening_time: result[0].opening_hours,
			phone: result[0].phone_no,
			email: result[0].email,
			business_description: result[0].description
		};
		res.redirect('/individual_business');
	});
});

app.get('/individual_business', login_required, function(req, res)
{
	console.log(req.session.business_name);
	res.render('business.html', {business: req.session.business});
});

app.post('/individual_business', login_required, function(req, res)
{
	con.query('SELECT * FROM Businesses WHERE title = ?', [req.body.business_name], function(err, result, fields) {
		if (err) throw err;
		var business = {
			business_name: result[0].title,
			opening_time: result[0].opening_hours,
			phone: result[0].phone_no,
			email: result[0].email,
			business_description: result[0].description
		};
		req.session.businessid = result[0].id;
		res.render('business.html', {business: business});
	});
});

app.get('/individual_business_user', function(req, res)
{
	res.render('business_user.html');
});

app.get('/my_bids', login_required, function(req, res)
{
	var requests_bidded = []
	con.query('SELECT * FROM Bids WHERE businessID = ?', [req.session.businessid], function(err, result, fields) {
		if (err) throw err;
		for (var i = 0; i < result.length; i++) {
			requests_bidded.push(result[i].requestID);
		}
		con.query('SELECT * FROM Requests', function(err, result, fields) {
			if (err) throw err;
			var bid_names = [];
			for (var i = 0; i < result.length; i++) {
				if (requests_bidded.includes(result[i].id))
					bid_names.push(result[i].event_name);
			}
			res.render('my_bids.html', {bids: bid_names});
		})
	});
});

app.get('/accepted_bids', login_required, function(req, res)
{
	res.render('accepted_bids.html', {login: req.session.username});
});

app.get('/signout', login_required, function(req, res)
{
	delete req.session.username;
	delete req.session.valid;
	delete req.session.business;
	delete req.session.businessid;
	delete req.session.request;
	delete req.session.error;
	delete req.session.userid;
	res.redirect('/');
});

app.get('/error', function(req, res)
{
	res.status(404);
	res.send('NOT FOUND');
});

var server = app.listen(8000, function() {});
console.log('http://localhost:8000')
