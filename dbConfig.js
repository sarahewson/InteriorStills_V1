const mysql = require('mysql');
// const dotenv = require('dotenv');
// create database connection.
const db = mysql.createConnection({ 
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'stills'
}); 

db.connect(function(err) {
	if (err) throw err;
	console.log('MySQL database is connected.');
});

module.exports = db;
