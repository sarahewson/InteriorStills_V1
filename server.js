
const express = require('express');			// import Express web Framework from NodeJS.
const session = require('express-session');	// import middleware to manage session data in web applications
const path = require('path');				// provides utilities for working with file and directory paths
const db = require('./dbConfig');			// set path for public folder.		
const mysql = require('mysql'); 			// import mySQL.(**move to dbConfig.js later)
const dotenv = require('dotenv'); 			// import env. for password...
const bodyparser = require('body-parser');	// import middleware to parse incoming request bodies
dotenv.config({ path: './.env'}); 			// point const env to .env file path (same level path as server.js file).
const app = express(); 						// start server.
const bcryptjs = require('bcryptjs');		// import JavaScript library used for password hashing	
const publicDirectory = path.join(__dirname, './public'); 	// define the Public directory to CSS & images.


app.use(express.static(publicDirectory)); // Point Express to use the static files in publicDirectory.
app.use(session({secret: 'yoursecret', resave: true, saveUninitialized: true}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// VIEW ENGINE SETUP
app.set('view engine', 'ejs'); 			// set ejs engine to display HTML.
app.use('/public', express.static('public')); 	// serve up static CSS files in public/stylesheets folder when public link is called in ejs files.



// ROUTE SETUP
app.get('/home', function(req, res) {
	res.render('home',{title: 'home'});
});

app.get('/about', function(req, res) {
	res.render('about',{title: 'about'});
});

app.get('/register', function(req, res) {
	res.render('register', { title: 'register', message: null }); // Initially passing null as the message
  });

app.get('/login', function(req, res) {
	res.render('login',{title: 'photographers portal', message: null});
});

app.get('/profiles', function(req, res) {
	res.render('profiles',{title: 'profiles'});
});

app.get('/photographerPage', function(req, res) {
	res.render('photographerPage', {title: 'photographerPage', first_name: null });
});

// dbRead page displays the retrieved data in an HTML table
app.get('/dbRead', function(req, res) {
	db.query("SELECT * FROM user", function (err, result) {
		if (err) throw err;
		console.log(result);
		res.render('dbRead', { title: 'xyz', userData: result});
	});
});


// REGISTER
app.post('/register', async function(req, res, next) {
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var password = req.body.password;
	var password_confirm = req.body.password_confirm;
  
	// Hash the password
	let hashed_password = await bcryptjs.hash(password, 8);
  
	// Check if the email already exists
	var emailCheckQuery = 'SELECT email FROM user WHERE email = ?';
	db.query(emailCheckQuery, [email], function(err, results) {
	  if (err) {
		console.log('Error:', err);
		return res.render('register', {
		  message: 'Error checking email existence'
		});
	  }
  
	  if (results.length > 0) {
		console.log('Email already exists.');
		return res.render('register', {
		  message: 'You already have an account with this email address.'
		});
	  }
  
	  // If email doesn't exist, proceed with registration
	  var sql = `INSERT INTO user (first_name, last_name, email, hashed_password) VALUES (?, ?, ?, ?)`;
	  console.log(sql);
	  db.query(sql, [first_name, last_name, email, hashed_password], function(err, result) {
		if (err) {
		  console.log('Error:', err);
		  return res.render('register', {
			message: 'Error registering user'
		  });
		}
  
		if (result && result.insertId) {
		  req.session.loggedin = true;
		  req.session.email = email;
		  console.log('User registered');
		  return res.redirect('/photographerPage');
		} else {
		  console.log('Registration failed for an unknown reason');
		  return res.render('register', {
			message: 'Registration failed for an unknown reason'
		  });
		}
	  });
	});
  });


// Login to the website with the hashed password
app.post('/login', function (req, res) {
	var email = req.body.email;
	var password = req.body.password;
	console.log("Login accessed.");
   
	// Check the database to find the user by email
	var checkQuery = `SELECT * FROM user WHERE email = ?`;
	db.query(checkQuery, [email], async function (err, results) {
		if (err) throw err;
	 
		console.log("Email:", email);
		console.log("Entered Password:", password);
   
		if (results.length > 0) {
			const user = results[0];
			const hashed_password = user.hashed_password;
   
		console.log("Hashed Password:", hashed_password)
   
			// Compare the entered password with the hashed password from the database
			const passwordMatch = await bcryptjs.compare(password, hashed_password);
   
			if (passwordMatch) {
				// Passwords match, user is authenticated
				req.session.user = user;
   
			if (user.user_type === 'admin') {
				// Admin is authenticated
				console.log("User Type: admin");
				res.redirect('/profiles');

			} else if (user.user_type === 'photographer') {
				// Regular user is authenticated
				console.log("User Type: photographer");
				res.redirect('photographerPage');
			} 
				
			} else {
				// Passwords don't match; render an error message on the login page
				console.log('Incorrect password');
				return res.render('login', { 
				message: 'Incorrect email or password' });
			}
		}
	});
	});

   

// Users can access this if they are logged in

// GET route to render the PhotographerPage form
// app.get('/photographerPage', function(req, res) {
// 	if (req.session.loggedin) {
// 	  // Assuming the user's email is stored in the session
// 	  console.log('request login session');
// 	  const email = req.session.email;
  
// 	  // Fetch user data from the database based on the user's email
// 	  db.query("SELECT * FROM user WHERE email = ?", [email], function(err, userData) {
// 		if (err) {
// 		  // Handle the error appropriately, e.g., send an error page
// 		  console.log('Error fetching user data:', err);
// 		  res.send('Error fetching user data.');
// 		} else {
// 		  if (userData.length > 0) {
// 			console.log('user data is correct.');
// 			res.render('photographerPage', { userData: userData[0] });
// 		  } else {
// 			// User not found based on the email
// 			console.log('user not found.');
// 			res.send('User not found.');
// 		  }
// 		}
// 	  });
// 	} else {
// 	  res.send('Please login to view this page.');
// 	}
//   });

app.get('/photographerPage', function(req, res) {
	// Fetch user data from the database
	console.log('fetched first_name');
	db.query("SELECT first_name, city FROM user WHERE id = ?", [id], function(err, userData) {
	  if (err) {
		console.log('Error fetching user data:', err);
		// Handle the error appropriately
		// Send an error response or render an error page
		res.send('Error fetching user data.');
	  } else {
		// Render the page and pass the userData to your EJS template
		console.log('retrieved photographer name from db');
		res.render('photographerPage', { first_name: userData[0].first_name });
	  }
	});
  });
  
//   // POST route to handle profile updates
//   app.post('/photographerPage', function(req, res) {
// 	if (req.session.loggedin) {
// 	  const email = req.session.email;
// 	  const first_name = req.body.first_name;
// 	  const bio = req.body.bio;
// 	  // Other updated fields...
  
// 	// Fetch user data from the database based on the user's email
// 	db.query("INSERT INTO first_name, bio FROM user WHERE email = ?", [first_name, bio, email], function(err, userData) {
// 		if (err) {
// 		  // Handle the error appropriately, e.g., send an error page
// 		  console.log('Error fetching user data:', err);
// 		  res.send('Error fetching user data.');
// 		} else {
// 		  if (userData.length > 0) {
// 			res.render('photographerPage', { userData: userData[0] });
// 		  } else {
// 			// User not found based on the email
// 			console.log('user not found');
// 			res.send('User not found.');
// 		  }
// 		}
// 	  });
// 	} else {
// 		console.log('please log in to view this page');
// 	  res.send('Please login to view this page.');
// 	}
//   });
	
  
// tell Express web Framework which port number to listen to.
app.listen(3000, function (req, res) { 
	console.log('server is running on port 3000.')
});