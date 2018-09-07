var mysql = require('mysql');

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
	/*
		con.connect(function(err) {
			if (err) throw err;
			console.log("con Connected!");
			con.query("CREATE TABLE Users (id int AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), first_name VARCHAR(255), last_name VARCHAR(255), phone_no VARCHAR(20), email VARCHAR(255))", function (err, result) {
				if (err) throw err;
				console.log("created Users table");
			});
		});
	*/
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
