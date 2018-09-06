var express = require('express');
var app = express();

const mysql = require('mysql');
//Create connection with database
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'partywhip'
});
//Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...');
});
// const app = express();
//Create database

//?????should be created only once
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE partywhip';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Database created...');
    });
});

//create a table e.g for users
app.get('/createpoststable', (req, res) => {
    let sql = 'CREATE TABLE Users(id int AUTO_INCREMENT, user_name VARCHAR(255), first_name VARCHAR(255), last_name VARCHAR(255), phone_number VARCHAR(255), email_address VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id))';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Users table created...');
    });
});


//insert a user
app.get('/insertusers', (req, res) => {
    let sql = 'INSERT INTO Users (user_name, first_name, last_name, phone_number, email_address, password) VALUES ?';
	var values = [
		['Bob123', 'Bob', 'sofjwe', '014274923', 'faoej@jojge.com', 'pass123' ],
		['Adam123', 'Adam', 'sofjwe', '91447923', 'adsf@jojge.com', 'pas12423' ]
	];
    db.query(sql, [values], (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Inserted a user...');
    });
});

//show users
app.get('/showusers', (req, res) => {
    let sql = 'SELECT * FROM Users';
    db.query(sql, (err, result, fields) => {
        if(err) throw err;
        console.log(result);
        res.send('Showed users...');
    });
});

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
/*
app.post('/', function(req, res) {
	res.render('home.html');
});
*/
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
	var my_name = req.body.name;
	console.log(my_name);
	res.render('welcome.html', {name:my_name});
});

app.get('/signup', function(req, res) 
{
	res.render('sign-up-form.html', {error:false});
});

app.post('/signup_submit', function(req, res){
	var id = req.body.username;
	var pass = req.body.password;
	var repass = req.body.repassword;
	var email = req.body.email;
	console.log(id);
	console.log(pass);
	console.log(repass);
	console.log(email);
	
	return res.redirect("/");
});

var server = app.listen(8000, function() {});

console.log('http://localhost:3000')
