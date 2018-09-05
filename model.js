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
	if (req.session.valid === undefined) req.session.valid = false;
	if (req.session.error === undefined) req.session.error = false;
	if (req.session.username === undefined) req.session.username = null;
	res.render('homepage.html', {error:req.session.error, login:req.session.username});
});

app.get('/signup', function(req, res) 
{
	res.render('sign_up.html');
});

//insert the user's information into the user table
app.post('/signup_submit',(req, res) => {
	var first = req.body.first_name;
	var last = req.body.last_name;
	var id = req.body.username;
	var pass = req.body.password;
	var repass = req.body.repassword;
	var phone = req.body.mobile_number;
	var email = req.body.email;
	
    let post = {user_name :id, first_name :first, last_name :last, password :pass, phone_nubmer :phone, email_address : email};
    let sql = 'INSERT INTO Users SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('User 1 added...');
	});

	console.log(first);
	console.log(last);
	console.log(id);
	console.log(pass);
	console.log(repass);
	console.log(phone);
	console.log(email);
	return res.redirect("/");
});

app.post('/login', (req, res)=> {
    let sql = `SELECT * FROM Users WHERE id = ${req.body.username}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Post fetched...');
	});
	//need to get the password from the corresponding table
	var id = req.body.username;
	var ps = req.body.password;
	console.log(id);
	console.log(ps);
	//once get the password from the database, compare ps with it
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

var server = app.listen(3000, function() {});

console.log('http://localhost:3000')