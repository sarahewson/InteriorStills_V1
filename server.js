
const express = require('express');			// import Express web Framework from NodeJS.
const session = require('express-session');	// import middleware to manage session data in web applications
// const MySQLStore = require('express-mysql-session')(session);
const path = require('path');				// provides utilities for working with file and directory paths
const db = require('./dbConfig');			// set path for public folder.		
const mysql = require('mysql'); 			// import mySQL.(**move to dbConfig.js later)
const dotenv = require('dotenv'); 			// import env. for password...
const bodyparser = require('body-parser');	// import middleware to parse incoming request bodies
dotenv.config({ path: './.env'}); 			// point const env to .env file path (same level path as server.js file).
const app = express(); 						// start server.
const bcryptjs = require('bcryptjs');		// import JavaScript library used for password hashing	
const publicDirectory = path.join(__dirname, './public'); 	// define the Public directory to CSS & images.
// const sessionStore = new MySQLStore({/* MySQL session store configuration */});

app.use(express.static(publicDirectory)); // Point Express to use the static files in publicDirectory.
app.use(session({secret: 'yoursecret', resave: true, saveUninitialized: true}));
// app.use(session({secret: 'your_secret_key', store: sessionStore, resave: false, saveUninitialized: false}));
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


app.get('/logout', function(req, res) {
	// Destroy the session
	req.session.destroy(function(err) {
	  if (err) {
		console.error(err);
		console.log('error logging out');
		res.redirect('/error'); // Redirect to an error page if something goes wrong
	  } else {
		console.log('logged out');
		res.redirect('/home'); // Redirect to home or any other page after logout
	  }
	});
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
	// var password_confirm = req.body.password_confirm;
  
	// Hash the password
	let hashed_password = await bcryptjs.hash(password, 8);
  
	// Check if the email already exists
	var emailCheckQuery = 'SELECT email FROM user WHERE email = ?';
	db.query(emailCheckQuery, [email], function(err, results) {
	  if (err) {
		console.log('Error:', err);
		return res.render('register', {
		  message: 'Error checking email address.'
		});
	  }
  
	  if (results.length > 0) {
		console.log('This email is already in use.');
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
		  return res.render('photographerPage');
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
				req.session.loggedin = true;  // see if req.session.loggedin = true; helps the user stay logged in?
				console.log(req.session.user);

			if (user.user_type === 'photographer') {
				// Regular user is authenticated
				console.log("User Type: photographer");
				res.render('photographerPage', { 
				title: 'xyz', 
				first_name:req.session.user.first_name,
				// last_name:req.session.user.last_name,
				bio:req.session.user.bio,
				city:req.session.user.city,
				phone:req.session.user.phone,
				email:req.session.user.email});
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

   

// DISPLAY DATABASE FIELDS FROM USER LOGIN SESSION.
app.get('/photographerPage', function(req, res) {
	console.log('this is the photographerPage');
	// Check if the user is logged in
    if (!req.session.user) {
        // If the user is not logged in, redirect to the login page
        return res.redirect('/login');
    }
	console.log(req.session.user);
	// correspond with line 157. Render the photographerPage with user information.
	res.render('photographerPage', { 
	title: 'xyz', 
	first_name: req.session.user.first_name,
	bio:req.session.user.bio,
	city:req.session.user.city,
	phone:req.session.user.phone,
	email:req.session.user.email
	});
  });


// // DISPLAY PhotographerAll PAGE TO SITE VISITORS WITHOUT LOGIN SESSION.
app.get('/photographerAll', function(req, res) {
    res.render('photographerAll', { title: 'photographerAll' });
});

app.post('/photographerAll', function(req, res) {
    console.log('this is the photographerAll POST request');
    res.redirect('/photographerAll');
});


// UNFINISHED CODE...
//   app.get('/photographerAll', function(req, res) {
//     // Retrieve image paths or data from the database in this route
//     var sql = `SELECT photo_path FROM photographs WHERE user_id = ?`;
//     // Assuming you have a user_id from the query string
//     const user_id = req.query.user_id;

//     db.query(sql, [user_id], function(err, results) {
//         if (err) {
//             // Handle the error accordingly
//             console.error(err);
//             res.status(500).send('Error retrieving data from the database');
//         } else {
//             // Extract image paths from the results
//             const imagePaths = results.map(result => result.photo_path);
            
//             // Render the page or send the image paths to the client
//             res.render('photographerAll', { imagePaths: imagePaths });
//         }
//     });
// });

// app.post('/photographerAll', function(req, res) {
//     // Handle data from the POST request, if needed
//     // For example, you can access the user_id sent via POST
//     const user_id = req.body.user_id;

//     // Redirect or perform actions based on the POST request
//     res.redirect('/photographerAll?user_id=' + user_id);
// });


  

	
// TELL EXPRESS WEB FRAMEWORK PORT NUMBER TO LISTEN TO.
app.listen(3000, function (req, res) { 
	console.log('server is running on port 3000.')
});