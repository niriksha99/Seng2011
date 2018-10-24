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
	if (req.session.username === null || req.session.username === undefined) {
		res.redirect('/error');
	} else {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		next();
	}
}

function bidder_required(req, res, next) {
	con.query('SELECT * FROM Businesses WHERE userID = (SELECT id FROM Users WHERE username = ?)', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		if (result.length <= 0) {
			res.redirect('/error');
		} else {
			res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			next();
		}
	});
}

app.get('/', function(req, res){
	if (req.session.valid === undefined) req.session.valid = false;
	if (req.session.error === undefined) req.session.error = false;
	if (req.session.username === undefined) req.session.username = null;
	if (req.session.userid === undefined) req.session.userid = null;
	var err = req.session.error;
	delete req.session.error;
	res.render('homepage.html', {error: err, login: req.session.username});
});

app.get('/signup', function(req, res)
{
	var err = 0;
	if (req.session.error === undefined) err = 0;
	else {
		err = req.session.error;
		delete req.session.error;
	}
	res.render('sign_up.html', {error : err});
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

	con.query('SELECT * FROM Users WHERE username = ?', [id], function(err, result, fields) {
		if (err) throw err;
		if (result.length > 0) {
			req.session.error = 1;
			return res.redirect('/signup');
		} else {
			con.query('SELECT * FROM Users WHERE email = ?', [email], function(err, result1, fields) {
				if (err) throw err;
				if (result1.length > 0) {
					req.session.error = 2;
					return res.redirect('/signup');
				} else {
					// insert new user (haven't checked if user exists)
					con.query('INSERT INTO Users SET ?', signup_user, function(err, res) {
						if (err) throw err;
						console.log('Inserted: ', res.insertId);
					});
					return res.redirect("/");
				}
			});
		}
	});


	// print all users, testing purpose
	// con.query('SELECT * FROM Users', function(err,rows) {
	//   if (err) throw err;
	//   console.log(rows);
	// });

});

app.post('/link_business_submit', login_required, function(req, res)
{
	var business_name = req.body.business_name;
	var opening_time = req.body.opening_time;
	var closing_time = req.body.closing_time;
	var phone = req.body.phone;
	var email = req.body.email;
	var address = req.body.address;
	var business_description = req.body.business_description;
	var events_cater = JSON.stringify(req.body.events_cater, null, 2);
	var delivery_options = JSON.stringify(req.body.delivery, null, 2);
	var business;

	con.query('SELECT * FROM Businesses WHERE title = ?', [business_name], function(err, result, fields) {
		if (err) throw err;
		if (result.length > 0) {
			req.session.error = 1;
			return res.redirect('/link_business');
		} else {
			// compare times are correct
			// check if at least one checkbox is done
			con.query('SELECT * FROM Users WHERE username = ?', [req.session.username], function(err, result, fields) {
				if (err) throw err;
				business = {
					userID: result[0].id,
					title: business_name,
					opening_time: opening_time,
					closing_time: closing_time,
					phone_no: phone,
					email: email,
					address: address,
					description: business_description,
					events_cater: events_cater,
					delivery_options: delivery_options,
					fame: 0.0
				};
				//console.log(business);
				con.query('INSERT INTO Businesses SET ?', business, function(err, res) {
					if (err) throw err;
					console.log('Inserted business: ', res.insertId);
					var rate = {
						businessID: res.insertId,
						oneStar: 0.0,
						twoStar: 0.0,
						threeStar: 0.0,
						fourStar: 0.0,
						fiveStar: 0.0,
						sum: 0
					};
					con.query('INSERT INTO RateSum SET ?', rate, function(err, result, fields) {
						if (err) throw err;
					});
				});
			});

			setTimeout(function () {
				con.query('SELECT * FROM Businesses', function(err,rows) {
				  if (err) throw err;
				  //console.log(rows);
				});
			}, 3000);

			req.session.business = {
				business_name: business_name,
				opening_time: opening_time,
				closing_time: closing_time,
				phone: phone,
				email: email,
				address: address,
				business_description: business_description,
				events_cater: JSON.parse(events_cater),
				delivery_options: JSON.parse(delivery_options),
				rate: 0.0,
				owner: true
			};
			return res.redirect('/individual_business');
		}
	});

});

app.post('/post_request', login_required, function(req, res)
{
	var event_name = req.body.event_name;
	var event_date = req.body.event_date.split('T')[0];
	var event_start_time = req.body.event_start_time;
	var event_end_time = req.body.event_end_time;
	var event_deadline = req.body.event_deadline.split('T')[0];
	var event_suburb = req.body.event_suburb;
	var event_type = JSON.stringify(req.body.event_type);
	var noPeople = req.body.noPeople;
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
			event_start_time: event_start_time,
			event_end_time: event_end_time,
			event_deadline: event_deadline,
			event_suburb: event_suburb,
			event_type: event_type,
			noPeople: noPeople,
			budget: budget,
			choice: choice,
			additional_info: additional_info,
			completed: completed
		};
		//console.log(request);
		con.query('INSERT INTO Requests SET ?', request, function(err, res) {
			if (err) throw err;
			console.log('Inserted request: ', res.insertId);
		});
	});

	setTimeout(function () {
		con.query('SELECT * FROM Requests', function(err,rows) {
		  if (err) throw err;
		  //console.log(rows);
		});
	}, 3000);

	req.session.request = {
			owner: req.session.userid,
			event_name: event_name,
			event_date: event_date,
			event_start_time: event_start_time,
			event_end_time: event_end_time,
			event_deadline: event_deadline,
			event_suburb: event_suburb,
			event_type: event_type,
			noPeople: noPeople,
			budget: budget,
			choice: choice,
			additional_info: additional_info,
			status: completed
		};

	//req.session.business_name = business_name;
	return res.redirect("/individual_request_user");
});

app.get('/catering_requests', login_required, bidder_required, function(req, res)
{
	con.query('SELECT * FROM Bids WHERE businessID = ?', [req.session.businessid], function(err, result, fields) {
		if (err) throw err;
		var bid_request = [];
		for (var i = 0 ; i < result.length; i++) {
			bid_request.push(result[i].requestID);
		}
		con.query('SELECT * FROM Requests', function(err, result, fields){
			if (err) throw err;
			var requests = [];
			for (var i = 0; i < result.length; i++) {
				if (!bid_request.includes(result[i].id)) {
					requests.push(result[i].event_name);
				}
			}
			res.render('catering_requests.html', {request_list: requests});
		});
	});
});

app.get('/individual_request', login_required, function(req, res)
{
	//console.log(req.session.event_name);
	var request_info = req.session.request;
	delete req.session.request;
	res.render('individual_request.html', {request: request_info});
});

app.post('/individual_request', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE event_name = ? AND completed = 0', [req.body.event_name], function(err, result, fields) {
		if(err) throw err;
		var request = {
			event_name: result[0].event_name,
			event_date: result[0].event_date,
			event_start_time: result[0].event_start_time.slice(0, -3),
			event_end_time: result[0].event_end_time.slice(0, -3),
			event_deadline: result[0].event_deadline,
			event_suburb: result[0].event_suburb,
			event_type: result[0].event_type,
			noPeople: result[0].noPeople,
			budget: result[0].budget,
			choice: result[0].choice,
			additional_info: result[0].additional_info
		};
		res.render('individual_request.html', {request: request});
	});
});

app.post('/delete_request', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE event_name = ?', [req.body.request], function(err, result) {
		if (err) throw err;
		var request_id = result[0].id;
		con.query('DELETE FROM Bids WHERE requestID = ?', [request_id], function(err, result) {
			if(err) throw err;
		});
		con.query('DELETE FROM Requests WHERE id = ?', [request_id], function(err, result) {
			if (err) throw err;
		});
	});
	res.redirect('/requests');
});


app.post('/accept_bid', login_required, function(req, res)
{
	var bid = JSON.parse(req.body.bid_info);

	con.query('SELECT * FROM Bids WHERE requestID = ?', [bid.requestid], function(err, result, fields) {
		if (err) throw err;
		for (var i = 0; i < result.length; i++) {
			if (result[i].businessID !== bid.businessid) {
				con.query('UPDATE Bids SET status = 0 WHERE businessID = ?', [result[i].businessID]);
			} else {
				con.query('UPDATE Bids SET status = 2 WHERE businessID = ?', [result[i].businessID]);
			}
		}
	});

	con.query('UPDATE Requests SET completed = 1 WHERE id = ?', [bid.requestid]);
	res.redirect('/requests');
});

app.post('/edit_bid', login_required, bidder_required, function(req, res)
{
	var bid = JSON.parse(req.body.bid_info);
	var price = req.body.price;
	var comment = req.body.additional_info;

	con.query('UPDATE Bids SET price = ? WHERE requestID = ? AND businessID = ?', [price, bid.requestid, bid.businessid], function(err, result, fields) {
		if (err) throw err;
	});
	con.query('UPDATE Bids SET comment = ? WHERE requestID = ? AND businessID = ?', [comment, bid.requestid, bid.businessid], function(err, result, fields) {
		if (err) throw err;
	});

	res.redirect('/my_bids');
});

app.post('/cancel_bid', login_required, function(req, res)
{
	var bid = JSON.parse(req.body.bid_info);
	con.query('UPDATE Bids SET status = 0 WHERE requestID = ? AND businessID = ?', [bid.requestid, bid.businessid], function(err, result, fields) {
		if (err) throw err;
	});
	res.redirect('/requests');
});

// delete bids by the bidder himself!
app.post('/delete_bid', login_required, bidder_required, function(req, res)
{
	var bid = JSON.parse(req.body.bid_info);
	con.query('DELETE FROM Bids WHERE requestID = ? AND businessID = ?', [bid.requestid, bid.businessid], function(err, result, fields) {
		if (err) throw err;
	});
	res.redirect('/my_bids');
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
	if (req.session.username !== null && req.session.username !== undefined) {
		res.render('homepage.html', {error: req.session.error, login: req.session.username});
	} else {
		res.redirect('/');
	}
});

//general search bar for event name or business name
app.post('/search', function(req, res)
{
	var key = req.body.search;
	var name = key.toLowerCase();
	con.query('SELECT * FROM Requests', function(err, result1, fields) {
		if (err) throw err;
		var event_result = [];
		for (var i = 0; i < result1.length; i++ ){
			if (result1[i].event_name.toLowerCase().includes(name)){
				event_result.push(result1[i].event_name);
			}
		}
		con.query('SELECT * FROM Businesses', function(err, result2, fields) {
			if (err) throw err;
			var business_result = [];
			for (var j = 0; j < result2.length; j++ ){
				if (result2[j].title.toLowerCase().includes(name)){
					business_result.push(result2[j].title);
				}
			}
			//console.log(event_result);
			//console.log(business_result);
			res.render('search.html', {request_list: event_result,business_list: business_result});
		});
	});
});

//advance search for events
app.post('/search_requests', function(req, res)
{
	var key = req.body.search_event_name;
	var date = req.body.search_event_date;
	var deadline = req.body.search_event_deadline;
	var suburb = req.body.event_suburb;
	var type = req.body.search_events_type;
	var cook = req.body.search_legendRadio;

	con.query('SELECT * FROM Requests', function(err, result, fields) {
		if (err) throw err;
		var event_result = [];
		var business_result = [];
		for (var i = 0; i < result.length; i++ ){
			if (typeof key !== 'undefined'){
				var name = key.toLowerCase();
				if (result[i].event_name.toLowerCase().includes(name)){
					if (!event_result.includes(result[i].event_name)){
						event_result.push(result[i].event_name);
					}
				}
			}
			if (typeof date !== 'undefined'){
				if (result[i].event_date == date){
					if (!event_result.includes(result[i].event_name)){
						event_result.push(result[i].event_name);
					}
				}
			}
			if (typeof dealine !== 'undefined'){
				if (result[i].event_deadline == dealine){
					if (!event_result.includes(result[i].event_name)){
						event_result.push(result[i].event_name);
					}
				}
			}
			if (typeof suburb !== 'undefined'){
				var sb = '"' + suburb.toLowerCase() + '"';
				if (result[i].event_suburb.toLowerCase() == sb){
					if (!event_result.includes(result[i].event_name)){
						event_result.push(result[i].event_name);
					}
				}
			}
			if (typeof type !== 'undefined'){
				for(var j = 0; j < type.length; j++){
					if (result[i].event_type == type[j]){
						if (!event_result.includes(result[i].event_name)){
							event_result.push(result[i].event_name);
						}
					}
				}
			}
			if (typeof cook !== 'undefined'){
				for(var m = 0; m < type.length; m++){
					if (result[i].choice == cook[m]){
						if (!event_result.includes(result[i].event_name)){
							event_result.push(result[i].event_name);
						}
					}
				}
			}
		}
		//console.log(event_result);
		//console.log(business_result);
		res.render('search.html', {request_list: event_result,business_list: business_result});

	});
});

//advance search for business
app.post('/search_business', function(req, res)
{
	var key = req.body.search_business_name;
	var type = req.body.search_events_cater;
	var delivery = req.body.search_delivery;
	con.query('SELECT * FROM Businesses', function(err, result, fields) {
		if (err) throw err;
		var event_result = [];
		var business_result = [];
		for (var i = 0; i < result.length; i++ ){
			if (typeof key !== 'undefined'){
				var name = key.toLowerCase();
				if (result[i].title.toLowerCase().includes(name)){
					if (!business_result.includes(result[i].title)){
						business_result.push(result[i].title);
					}
				}
			}
			if (typeof type !== 'undefined'){
				for(var j = 0; j < type.length; j++){
					if (result[i].events_cater == type[j]){
						if (!business_result.includes(result[i].title)){
							business_result.push(result[i].title);
						}
					}
				}
			}
			if (typeof delivery !== 'undefined'){
				for(var m = 0; m < delivery.length; m++){
					if (result[i].delivery_options == delivery[j]){
						if (!business_result.includes(result[i].title)){
							business_result.push(result[i].title);
						}
					}
				}
			}
		}
		//console.log(event_result);
		//console.log(business_result);
		res.render('search.html', {request_list: event_result,business_list: business_result});
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

app.get('/individual_bid', login_required, bidder_required, function(req, res)
{
	var bid_info = req.session.bid;
	delete req.session.bid;
	res.render('individual_bid.html', {bid: bid_info});
});

app.post('/individual_bid', login_required, bidder_required, function(req, res)
{
	//select Requests.*, Businesses.* from Requests right join Businesses on event_name = 'death from assignment'
	con.query('SELECT Requests.*, Bids.* FROM Requests LEFT JOIN Bids ON Requests.id = Bids.requestID WHERE Requests.event_name = ?', [req.body.event_name], function(err, result, fields) {
		if (err) throw err;
		var bid_info = {
			event_name: result[0].event_name,
			event_date: result[0].event_date,
			event_start_time: result[0].event_start_time.slice(0, -3),
			event_end_time: result[0].event_end_time.slice(0, -3),
			event_deadline: result[0].event_deadline,
			event_suburb: result[0].event_suburb,
			event_type: result[0].event_type,
			noPeople: result[0].noPeople,
			choice: result[0].choice,
			budget: result[0].budget,
			additional_info: result[0].additional_info,
			amount: result[0].price,
			comment: result[0].comment,
			status: result[0].status,
			requestid: result[0].requestID,
			businessid: result[0].businessID
		};
		res.render('individual_bid.html', {bid: bid_info});
	});
});

app.get('/individual_request_user', login_required, function(req, res)
{
	//console.log(req.session.event_name);
	// var owner = true;
	// var bidder = !owner;
	var request_info = req.session.request;
	delete req.session.request;
	con.query('SELECT Bids.*, Businesses.* FROM Bids LEFT JOIN Businesses ON Bids.businessID = Businesses.id WHERE Bids.requestID = (SELECT id FROM Requests WHERE userID = ? AND event_name = ?)',
				[request_info.owner, request_info.event_name], function(err, result, fields) {
		if (err) throw err;
		var bid_list = [];
		for (var i = 0; i < result.length; i++) {
			var bid = {
				value: result[i].price,
				info: result[i].comment,
				business: result[i].title,
				requestid: req_id,
				businessid: result[i].businessID
			}
			bid_list.push(bid);
		}
		res.render('individual_request_user.html', {request: request_info, biddings: bid_list});
	});
});

app.post('/individual_request_user', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE userID = ? AND event_name = ?', [req.session.userid, req.body.event_name], function(err, result, fields) {
		if(err) throw err;
		var request = {
			req_id: result[0].id,
			event_name: result[0].event_name,
			event_date: result[0].event_date,
			event_start_time: result[0].event_start_time.slice(0, -3),
			event_end_time: result[0].event_end_time.slice(0, -3),
			event_deadline: result[0].event_deadline,
			event_suburb: result[0].event_suburb,
			event_type: result[0].event_type,
			noPeople: result[0].noPeople,
			budget: result[0].budget,
			choice: result[0].choice,
			additional_info: result[0].additional_info,
			status: result[0].completed
		};
		if (request.status === 0) {
			con.query('SELECT Bids.*, Businesses.* FROM Bids LEFT JOIN Businesses ON Bids.businessID = Businesses.id WHERE Bids.requestID = ?', [request.req_id], function(err, result, fields) {
				if (err) throw err;
				var bid_list = [];
				for (var i = 0; i < result.length; i++) {
					if (result[i].status === 1) {
						var bid = {
							value: result[i].price,
							info: result[i].comment,
							business: result[i].title,
							requestid: result[i].req_id,
							businessid: result[i].businessID
						}
						bid_list.push(bid);
					}
				}
				res.render('individual_request_user.html', {request: request, biddings: bid_list});
			});
		} else if (request.status === 1) {
			con.query('SELECT Bids.*, Businesses.* FROM Bids LEFT JOIN Businesses ON Bids.businessID = Businesses.id WHERE Bids.requestID = ? AND Bids.status = 2', [request.req_id], function(err, result, fields) {
				if (err) throw err;
				var bid = {
					value: result[0].price,
					info: result[0].comment,
					business: result[0].title,
					requestid: req_id,
					businessid: result[0].businessID
				}
				res.render('individual_request_user.html', {request: request, biddings: bid});
			});
		}
	});
});

app.post('/edit_request', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE userID = ? AND event_name = ?', [req.session.userid, req.body.request], function(err, result, fields) {
		if(err) throw err;
		var request_info = {
			req_id: result[0].id,
			event_name: result[0].event_name,
			event_date: result[0].event_date,
			event_start_time: result[0].event_start_time.slice(0, -3),
			event_end_time: result[0].event_end_time.slice(0, -3),
			event_deadline: result[0].event_deadline,
			event_suburb: result[0].event_suburb,
			event_type: result[0].event_type,
			noPeople: result[0].noPeople,
			budget: result[0].budget,
			choice: result[0].choice,
			additional_info: result[0].additional_info,
			status: result[0].completed
		};
		res.render('edit_request_form.html', {user: req.session.username, request: request_info});
	});
});

app.post('/update_request', login_required, function(req, res)
{
	var event_name = req.body.event_name;
	var event_date = req.body.event_date.split('T')[0];
	var event_start_time = req.body.event_start_time;
	var event_end_time = req.body.event_end_time;
	var event_deadline = req.body.event_deadline.split('T')[0];
	var event_suburb = req.body.event_suburb;
	var event_type = JSON.stringify(req.body.event_type);
	var noPeople = req.body.noPeople;
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
			event_start_time: event_start_time,
			event_end_time: event_end_time,
			event_deadline: event_deadline,
			event_suburb: event_suburb,
			event_type: event_type,
			noPeople: noPeople,
			budget: budget,
			choice: choice,
			additional_info: additional_info,
			completed: completed
		};
		//console.log(request);
		con.query('UPDATE Requests SET ? WHERE id = ?', [request, req.body.request], function(err, res) {
			if (err) throw err;
		});
	});

	setTimeout(function () {
		con.query('SELECT * FROM Requests', function(err,rows) {
		  if (err) throw err;
		  //console.log(rows);
		});
	}, 3000);

	req.session.request = {
		owner: req.session.userid,
		event_name: event_name,
		event_date: event_date,
		event_start_time: event_start_time,
		event_end_time: event_end_time,
		event_deadline: event_deadline,
		event_suburb: event_suburb,
		event_type: event_type,
		noPeople: noPeople,
		budget: budget,
		choice: choice,
		additional_info: additional_info,
		status: completed
	};

	return res.redirect("/individual_request_user");
})

app.get('/make_request', login_required, function(req, res)
{
	res.render('request_form.html', {user: req.session.username});
});

app.get('/link_business', login_required, function(req, res)
{
	var err = 0;
	if (req.session.error === undefined) err = 0;
	else {
		err = req.session.error;
		delete req.session.error;
	}
	res.render('link_business.html', {error : err});
});

app.post('/edit_business', login_required, bidder_required, function(req, res)
{
	var business = JSON.parse(req.body.business);
	con.query('SELECT * FROM Businesses WHERE userID = ? AND title = ?', [req.session.userid, business.business_name], function(err, result, fields) {
		if (err) throw err;
		var business_info = {
			business_name: result[0].title,
			opening_time: result[0].opening_time.slice(0, -3),
			closing_time: result[0].closing_time.slice(0, -3),
			phone: result[0].phone_no,
			email: result[0].email,
			address: result[0].address,
			business_description: result[0].description,
			events_cater: JSON.parse(result[0].events_cater),
			delivery_options: JSON.parse(result[0].delivery_options),
		};
		res.render('edit_business.html', {business: business_info});
	})
});

app.post('/update_business', login_required, bidder_required, function(req, res)
{
	var business_name = req.body.business;
	var opening_time = req.body.opening_time;
	var closing_time = req.body.closing_time;
	var phone = req.body.phone;
	var email = req.body.email;
	var address = req.body.address;
	var business_description = req.body.business_description;
	var events_cater = JSON.stringify(req.body.events_cater, null, 2);
	var delivery_options = JSON.stringify(req.body.delivery, null, 2);
	var business;

	con.query('SELECT * FROM Users WHERE username = ?', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		business = {
			userID: result[0].id,
			title: business_name,
			opening_time: opening_time,
			closing_time: closing_time,
			phone_no: phone,
			email: email,
			address: address,
			description: business_description,
			events_cater: events_cater,
			delivery_options: delivery_options
		};
		con.query('UPDATE Businesses SET ? WHERE userID = ? AND title = ?', [business, business.userID, req.body.business], function(err, result, fields) {
			if (err) throw err;
		});
	});

	setTimeout(function () {
		con.query('SELECT * FROM Businesses', function(err,rows) {
		  if (err) throw err;
		  //console.log(rows);
		});
	}, 3000);

	req.session.business = {
		business_name: business_name,
		opening_time: opening_time,
		closing_time: closing_time,
		phone: phone,
		email: email,
		address: address,
		business_description: business_description,
		events_cater: JSON.parse(events_cater),
		delivery_options: JSON.parse(delivery_options),
		rate: 0.0,
		owner: true
	};

	return res.redirect('/individual_business');
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

app.post('/bidding', login_required, bidder_required, function(req, res)
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
		con.query('INSERT INTO Bids SET ?', bid, function(err, res) {
			if (err) throw err;
			console.log('Inserted: ', res.insertId);
		});
		req.session.bid = {
			event_name: result[0].event_name,
			event_date: result[0].event_date,
			event_start_time: result[0].event_start_time.slice(0, -3),
			event_end_time: result[0].event_end_time.slice(0, -3),
			event_deadline: result[0].event_deadline,
			event_suburb: result[0].event_suburb,
			event_type: result[0].event_type,
			noPeople: result[0].noPeople,
			choice: result[0].choice,
			budget: result[0].budget,
			additional_info: result[0].additional_info,
			amount: req.body.price,
			comment: req.body.additional_info,
			status: 1,
			requestid: result[0].id,
			businessid: req.session.businessid
		};
		res.redirect('/individual_bid');
	});
});

app.get('/individual_business', login_required, bidder_required, function(req, res)
{
	var business_info = req.session.business;
	delete req.session.business;
	con.query('SELECT * FROM RateSum WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business_info.business_name], function(err, result, fields) {
		if (err) throw err;
		var total = result[0].sum;
		var value = result[0].oneStar + result[0].twoStar * 2 + result[0].threeStar * 3 + result[0].fourStar * 4 + result[0].fiveStar * 5;
		value = value / total;
		business_info.rate = value.toFixed(2);
		if (total == 0) {
			business_info.rate = 0.0;
		}
		res.render('business.html', {business: business_info});
	});
});

app.post('/individual_business', login_required, bidder_required, function(req, res)
{
	con.query('SELECT * FROM Businesses WHERE title = ?', [req.body.business_name], function(err, result, fields) {
		if (err) throw err;
		var business = {
			business_name: result[0].title,
			opening_time: result[0].opening_time.slice(0, -3),
			closing_time: result[0].closing_time.slice(0, -3),
			phone: result[0].phone_no,
			email: result[0].email,
			address: result[0].address,
			business_description: result[0].description,
			events_cater: JSON.parse(result[0].events_cater),
			delivery_options: JSON.parse(result[0].delivery_options),
			rate: result[0].fame,
			owner: (result[0].userID === req.session.userid)
		};
		req.session.businessid = result[0].id;
		con.query('SELECT * FROM RateSum WHERE businessID = ?', [req.session.businessid], function(err, result3, fields) {
			if (err) throw err;
			var total = result3[0].sum;
			var value = result3[0].oneStar + result3[0].twoStar * 2 + result3[0].threeStar * 3 + result3[0].fourStar * 4 + result3[0].fiveStar * 5;
			value = value / total;
			business.rate = value.toFixed(2);
			if (total == 0) {
				business.rate = 0.0;
			}
		});

		con.query('SELECT * FROM Ratings WHERE userID = ? AND businessID = ?', [req.session.userid, result[0].id], function(err, result2, fields) {
			if (err) throw err;
			var rated = 0;
			if (result2.length > 0) {
				rated = result2[0].rate;
			}
			res.render('business.html', {business: business, rated: rated});
		});
	});
});

app.get('/individual_business_everyone', function(req, res)
{
	res.render('business_everyone.html');
});

app.get('/my_bids', login_required, bidder_required, function(req, res)
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

app.get('/active_bids', login_required, bidder_required, function(req, res)
{
	var accepted = [];
	con.query('SELECT * FROM Bids WHERE businessID = ?', [req.session.businessid], function(err, result, fields) {
		if (err) throw err;
		for (var i = 0; i < result.length; i++) {
			if (result[i].status === 1) {
				accepted.push(result[i].requestID);
			}
		}
		var acc_bids = [];
		con.query('SELECT * FROM Requests', function(err, result, fields) {
			if (err) throw err;
			for (var i = 0; i < result.length; i++) {
				if (accepted.includes(result[i].id))
					acc_bids.push(result[i].event_name);
			}
		})
		res.render('my_bids.html', {bids: acc_bids});
	})
});

app.get('/inactive_bids', login_required, bidder_required, function(req, res)
{
	var accepted = [];
	con.query('SELECT * FROM Bids WHERE businessID = ?', [req.session.businessid], function(err, result, fields) {
		if (err) throw err;
		for (var i = 0; i < result.length; i++) {
			if (result[i].status === 0) {
				accepted.push(result[i].requestID);
			}
		}
		var acc_bids = [];
		con.query('SELECT * FROM Requests', function(err, result, fields) {
			if (err) throw err;
			for (var i = 0; i < result.length; i++) {
				if (accepted.includes(result[i].id))
					acc_bids.push(result[i].event_name);
			}
		})
		res.render('my_bids.html', {bids: acc_bids});
	})
});

app.get('/accepted_bids', login_required, bidder_required, function(req, res)
{
	var accepted = [];
	con.query('SELECT * FROM Bids WHERE businessID = ?', [req.session.businessid], function(err, result, fields) {
		if (err) throw err;
		for (var i = 0; i < result.length; i++) {
			if (result[i].status === 2) {
				accepted.push(result[i].requestID);
			}
		}
		var acc_bids = [];
		con.query('SELECT * FROM Requests', function(err, result, fields) {
			if (err) throw err;
			for (var i = 0; i < result.length; i++) {
				if (accepted.includes(result[i].id))
					acc_bids.push(result[i].event_name);
			}
		})
		res.render('my_bids.html', {accepted: acc_bids});
	})
});


app.get('/sort_by_price_low', function(req, res)
{
	con.query('SELECT * FROM Requests', function(err, result, fields) {
		if (err) throw err;
		// put info in 2d array
		var sort_by_price = [];
		for (var i = 0; i < result.length; i++) {
			sort_by_price.push(result[i].budget);
			sort_by_price.push(result[i].event_name);
		}
		// use bubblesort
		for (var i = 0; i < sort_by_price.length; i=i+2) {
			for (var j = sort_by_price.length-2; j > i; j=j-2) {
				if (sort_by_price[j] <= sort_by_price[j-2]) {
					var temp1 = sort_by_price[j];
					sort_by_price[j] = sort_by_price[j-2];
					sort_by_price[j-2] = temp1;
					var temp2 = sort_by_price[j+1];
					sort_by_price[j+1] = sort_by_price[j-1];
					sort_by_price[j-1] = temp2;
				}
			}
		}

		for (var i = 0; i < result.length; i=i+1) {
			sort_by_price.splice(i, 1);
		}
		res.render('catering_requests.html', {request_list: sort_by_price});

	});
});

app.get('/sort_by_price_high', function(req, res)
{
	con.query('SELECT * FROM Requests', function(err, result, fields) {
		if (err) throw err;
		// put info in 2d array
		var sort_by_price = [];
		for (var i = 0; i < result.length; i++) {
			sort_by_price.push(result[i].budget);
			sort_by_price.push(result[i].event_name);
		}
		// use bubblesort
		for (var i = 0; i < sort_by_price.length; i=i+2) {
			for (var j = sort_by_price.length-2; j > i; j=j-2) {
				if (sort_by_price[j] >= sort_by_price[j-2]) {
					var temp1 = sort_by_price[j];
					sort_by_price[j] = sort_by_price[j-2];
					sort_by_price[j-2] = temp1;
					var temp2 = sort_by_price[j+1];
					sort_by_price[j+1] = sort_by_price[j-1];
					sort_by_price[j-1] = temp2;
				}
			}
		}

		for (var i = 0; i < result.length; i=i+1) {
			sort_by_price.splice(i, 1);
		}

		res.render('catering_requests.html', {request_list: sort_by_price});
	});
});

app.get('/bidded_requests', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE userID = (SELECT id FROM Users WHERE username = ?)', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		var requests = [];
		for (var i = 0; i < result.length; i++) {
			requests.push(result[i].completed);
			requests.push(result[i].event_name);
		}
		for (var i = 0; i < requests.length; i=i+2) {
			if (requests[i] == 0) {
				requests.splice(i, 1);
				requests.splice(i, 1);
				i = i-2;
			}
		}

		for (var i = 0; i < result.length; i=i+1) {
			requests.splice(i, 1);
		}
		res.render('my_requests.html', {request_list: requests});
	});
});

app.get('/non_bidded_requests', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE userID = (SELECT id FROM Users WHERE username = ?)', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		var requests = [];
		for (var i = 0; i < result.length; i++) {
			requests.push(result[i].completed);
			requests.push(result[i].event_name);
		}
		for (var i = 0; i < requests.length; i=i+2) {
			if (requests[i] != 0) {
				requests.splice(i, 1);
				requests.splice(i, 1);
				i = i-2;
			}
		}

		for (var i = 0; i < result.length; i=i+1) {
			requests.splice(i, 1);
		}
		res.render('my_requests.html', {request_list: requests});
	});
});

app.get('/completed_requests', login_required, function(req, res)
{
	con.query('SELECT * FROM Requests WHERE userID = (SELECT id FROM Users WHERE username = ?)', [req.session.username], function(err, result, fields) {
		if (err) throw err;
		var requests = [];
		for (var i = 0; i < result.length; i++) {
			requests.push(result[i].completed);
			requests.push(result[i].event_name);
		}
		for (var i = 0; i < requests.length; i=i+2) {
			if (requests[i] == 0) {
				requests.splice(i, 1);
				requests.splice(i, 1);
				i = i-2;
			}
		}

		for (var i = 0; i < result.length; i=i+1) {
			requests.splice(i, 1);
		}
		res.render('my_requests.html', {request_list: requests});
	});
});

// implement on frontend once rating is done
app.get('/top_5_business', function(req, res)
{
	con.query('SELECT * FROM Business', function(err, result, fields) {
		if (err) throw err;
		var sort_by_rating = [];
		for (var i = 0; i < result.length; i++) {
			sort_by_rating.push(result[i].rating);
			sort_by_rating.push(result[i].title);
		}
		// use bubblesort
		for (var i = 0; i < sort_by_rating.length; i=i+2) {
			for (var j = sort_by_rating.length-2; j > i; j=j-2) {
				if (sort_by_rating[j] >= sort_by_rating[j-2]) {
					var temp1 = sort_by_rating[j];
					sort_by_rating[j] = sort_by_rating[j-2];
					sort_by_rating[j-2] = temp1;
					var temp2 = sort_by_rating[j+1];
					sort_by_rating[j+1] = sort_by_rating[j-1];
					sort_by_rating[j-1] = temp2;
				}
			}
		}

		for (var i = 0; i < result.length; i=i+1) {
			sort_by_price.splice(i, 1);
		}

		var top_5_business = [];
		for (var i = 0; i < 5; i=i+1) {
			top_5_business.push(sort_by_rating[i]);
		}

		res.render('homepage.html', {business_list: top_5_business});

	});
});

app.post('/rate', login_required, function(req, res)
{
	var val = parseInt(req.body.rate_star, 10);
	// get business info
	var business = JSON.parse(req.body.business);
	//console.log(business.business_name);

	if (val === 1) {
		//console.log("Rate 1 star!");
		con.query('UPDATE RateSum SET oneStar = (oneStar + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
		con.query('UPDATE RateSum SET sum = (sum + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
	} else if (val === 2) {
		//console.log("Rate 2 star!");
		con.query('UPDATE RateSum SET twoStar = (twoStar + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
		con.query('UPDATE RateSum SET sum = (sum + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
	} else if (val === 3) {
		//console.log("Rate 3 star!");
		con.query('UPDATE RateSum SET threeStar = (threeStar + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
		con.query('UPDATE RateSum SET sum = (sum + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
	} else if (val === 4) {
		//console.log("Rate 4 star!");
		con.query('UPDATE RateSum SET fourStar = (fourStar + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
		con.query('UPDATE RateSum SET sum = (sum + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
	} else if (val === 5) {
		//console.log("Rate 5 star!");
		con.query('UPDATE RateSum SET fiveStar = (fiveStar + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
		con.query('UPDATE RateSum SET sum = (sum + 1) WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result) {
			if (err) throw err;
		});
	}

	con.query('SELECT * FROM RateSum WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result, fields) {
		if (err) throw err;
		var rating = {
			userID: req.session.userid,
			businessID: result[0].businessID,
			rate: val,
			comment: req.body.comment
		};
		con.query('INSERT INTO Ratings SET ?', rating, function(err, result, fields) {
			if (err) throw err;
		});
	});

	setTimeout(function () {
		con.query('SELECT * FROM Businesses', function(err, rows) {
			if (err) throw err;
			//console.log(rows);
		});
	}, 3000);

	con.query('SELECT * FROM RateSum WHERE businessID = (SELECT id FROM Businesses WHERE title = ?)', [business.business_name], function(err, result, fields) {
		if (err) throw err;
		var total = result[0].sum;
		var value = result[0].oneStar + result[0].twoStar * 2 + result[0].threeStar * 3 + result[0].fourStar * 4 + result[0].fiveStar * 5;
		value = value / total;
		business.rate = value.toFixed(2);
		res.render('business.html', {business: business, rated: val});
	});
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
