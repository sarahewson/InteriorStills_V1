
const express = require('express');		// import Express web Framework from NodeJS.
const path = require('path');			// set path for public folder.		
const mysql = require('mysql'); 		// import mySQL.(**move to dbConfig.js later)
const dotenv = require('dotenv'); 		// import env. for password...
dotenv.config({ path: './.env'}); 		// point const env to .env file path (same level path as server.js file).
const app = express(); 					// start server.


const db = mysql.createConnection({ 	// create database connection.(**move to dbConfig.js later)
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE
}); 

const publicDirectory = path.join(__dirname, './public'); 	// define the Public directory to CSS & images.
app.use(express.static(publicDirectory)); // Point Express to use the static files in publicDirectory.


app.set('view engine', 'ejs'); 			// set ejs engine to display HTML.

app.use('/public', express.static('public')); 	// serve up static CSS files in public/stylesheets folder when public link is called in ejs files.
// app.use(session({secret: 'yoursecret', resave: true, saveUninitialized: true}));

db.connect(function(err) {				// (**move to dbConfig.js later)			
	if (err) throw err;					// check step 70 how to do this.
	console.log('MySQL database is connected successfully!');
});



app.get('/home', function(req, res) {
	res.render('home',{title: 'home'});
});

app.get('/about', function(req, res) {
	res.render('about',{title: 'about'});
});

app.get('/login', function(req, res) {
	res.render('login',{title: 'login'});
});

app.get('/register', function(req, res) {
	res.render('register',{title: 'Register'});
});

app.get('/profiles', function(req, res) {
	res.render('profiles.ejs',{title: 'profiles'});
});

// dbRead page displays the retrieved data in an HTML table
app.get('/dbRead', function(req, res) {
	db.query("SELECT * FROM users", function (err, result) {
		if (err) throw err;
		console.log(result);
		res.render('dbRead', { title: 'xyz', userData: result});
	});
});


// writing data captured on home page form to MySQL database.
// When a user insert data in the HTML form on home page.
// LOGIN USER from 112 steps doc.
// app.post('/', function(req, res) {
// 	var abcd = req.body.id;
// 	var bcde = req.body.first_name;
// 	var xyz = req.body.email;
// 	console.log(req.body); 
// 	var sql = `INSERT INTO users (id, first_name, email) VALUES ("${abcd}", "${bcde}", "${xyz}")`;
// 	db.query(sql, function (err, result) {
// 		if (err) throw err;
// 		console.log("1 record inserted");
// 	});
// 	return res.render('index', {errormessage: 'insert data successfully'});
// });

//LOGIN USER from swimschool code
app.post('/auth', function(req, res) {
	let email = req.body.email;
	let password = req.body.password;
	if (email && password) {
		db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.email = email;				
				res.redirect('/memberportal');				
			} else {
				res.send('Incorrect email address and/or password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter email address and password!');
		res.end();
	}
});


app.listen(3000, function (req, res) { // tell Express web Framework which port number to listen to.
	console.log('server is running on port 3000.')
});