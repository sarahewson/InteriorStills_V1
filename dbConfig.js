const mysql = require('mysql');
// const session = require('express-session');	// import middleware to manage session data in web applications
// const MySQLStore = require('express-mysql-session')(session);
// const dotenv = require('dotenv');


 // MySQL session store configuration;
const db = mysql.createConnection ({
// const sessionStore = new MySQLStore   // create database connection.
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'stills',
	// clearExpired: true, // Automatically remove expired sessions
	// checkExpirationInterval: 900000, // How frequently expired sessions should be cleared (in milliseconds)
	// expiration: 86400000 // Session expiration time in milliseconds (optional)
}); 




db.connect(function(err) {
	if (err) throw err;
	console.log('MySQL database is connected.');
});

module.exports = db;
