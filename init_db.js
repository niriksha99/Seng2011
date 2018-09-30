var mysql = require('mysql');
var con;

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

	basic_query("CREATE TABLE Requests (id INT AUTO_INCREMENT PRIMARY KEY, userID INT, event_name VARCHAR(255), event_date DATE, event_time TIME, event_deadline DATE, event_suburb VARCHAR(255), event_type VARCHAR(255), noPeople INT, qualityLevel VARCHAR(255), budget FLOAT(10,2), choice VARCHAR(255), additional_info VARCHAR(255), completed INT, FOREIGN KEY (userID) REFERENCES Users(id)) ", "created Requests table");
	// not sure if foreign key is set up properly

	basic_query("CREATE TABLE Businesses (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), userID INT, opening_hours VARCHAR(255), phone_no VARCHAR(20), email VARCHAR(255), description VARCHAR(255), FOREIGN KEY (userID) REFERENCES Users(id))", "created Businesses table");	// link userID to Users(id)

	basic_query("CREATE TABLE Bids(requestID INT, businessID INT, price FLOAT(10,2), comment VARCHAR(255), status BIT, FOREIGN KEY (requestID) REFERENCES Requests(id), FOREIGN KEY (businessID) REFERENCES Businesses(id), CONSTRAINT pk PRIMARY KEY(requestID, businessID)) ", "created Bids table");
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
