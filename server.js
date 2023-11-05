// server.js
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
var parseUrl = require('body-parser');
// var path = require('path');
// var db = require('./dbConfig');
const app = express();

var mysql = require('mysql');

let encodeUrl = parseUrl.urlencoded({ extended: false });

// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
es.render('home', { title: 'Home' });
});

//session middleware
app.use(sessions({
    secret: "thisismysecrctekey",
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    resave: false
}));

app.use(cookieParser());

var con = mysql.createConnection({
    host: "localhost",
    user: "root", // my username
    password: "", // my password
    database: "stills"
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.ejs');
})

app.post('/register', encodeUrl, (req, res) => {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;

    con.connect(function(err) {
        if (err){
            console.log(err);
        };
        // checking user already registered or no
        con.query(`SELECT * FROM users WHERE email = '${email}' AND password  = '${password}'`, function(err, result){
            if(err){
                console.log(err);
            };
            if(Object.keys(result).length > 0){
                res.sendFile(__dirname + '/failReg.ejs');
            }else{
            //creating user page in userPage function
            function userPage(){
                // We create a session for the dashboard (user page) page and save the user data to this session:
                req.session.user = {
                    firstname: first_name,
                    lastname: last_name,
                    email: email,
                    password: password 
                };

                res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Login and register form with Node.js, Express.js and MySQL</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container">
                        <h3>Hi, ${req.session.user.first_name} ${req.session.user.last_name}</h3>
                        <a href="/">Log out</a>
                    </div>
                </body>
                </html>
                `);
            }
                // inserting new user data
                var sql = `INSERT INTO users (first_name, last_name, email, password) VALUES ('${first_name}', '${last_name}', '${email}', '${password}')`;
                con.query(sql, function (err, result) {
                    if (err){
                        console.log(err);
                    }else{
                        // using userPage function for creating user page
                        userPage();
                    };
                });

        }

        });
    });


});

app.get("/login", (req, res)=>{
    res.sendFile(__dirname + "/login.ejs");
});

app.post("/dashboard", encodeUrl, (req, res)=>{
    var user_name = req.body.user_name;
    var password = req.body.password;

    con.connect(function(err) {
        if(err){
            console.log(err);
        };
        con.query(`SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`, function (err, result) {
          if(err){
            console.log(err);
          };

          function userPage(){
            // We create a session for the dashboard (user page) page and save the user data to this session:
            req.session.user = {
                first_name: result[0].first_name,
                last_name: result[0].last_name,
                email: email,
                password: password 
            };

            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Login and register form with Node.js, Express.js and MySQL</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container">
                    <h3>Hi, ${req.session.user.first_name} ${req.session.user.last_name}</h3>
                    <a href="/">Log out</a>
                </div>
            </body>
            </html>
            `);
        }

        if(Object.keys(result).length > 0){
            userPage();
        }else{
            res.sendFile(__dirname + '/failLog.html');
        }

        });
    });
});

// app.listen(4000, ()=>{
//     console.log("Server running on port 4000");
// });

app.listen(3000);
console.log('Node app is running on port 3000');


// GANESHAN'S CODES BELOW FOR REFERENCE - ABOVE IS NEW CODE FROM the following link:
// https://dev.to/jahongir2007/creating-a-login-and-registration-form-with-nodejs-expressjs-and-mysql-database-160n

// var express = require('express');
// var path = require('path');
// var db = require('./dbConfig');
// var app = express();
 
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
 
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', function(req, res, next) {
// 	res.render('home', { title: 'Home' });
// });

// app.post('/', function(req, res, next) {
// 	var search = req.body.search;
// 	console.log(search);
// 	//db.query(`SELECT * FROM incidents WHERE beach="${search}"`, function (err, result) {
// 	db.query(`SELECT * FROM incidents WHERE MATCH description AGAINST ("${search}" WITH QUERY EXPANSION);`, function (err, result) {
// 		if (err) throw err;
// 		console.log(result);
// 		res.render('getIncidents', { title: 'xyz', incidentData: result});
// 	});
// });


// app.get('/videos', function(req, res, next) {
// 	res.render('videos', { title: 'Videos' });
// });


// app.get('/addIncidents', function(req, res, next) {
// 	res.render('addIncidents', { title: 'Home' });
// });

 
// app.get('/getIncidents', function(req, res){
// 	db.query("SELECT * FROM incidents", function (err, result) {
// 		if (err) throw err;
// 		console.log(result);
// 		res.render('getIncidents', { title: 'xyz', incidentData: result});
// 	});
// });
 
// app.get('/deaths', function(req, res){
// 	db.query("SELECT * FROM deaths", function (err, result) {
// 		if (err) throw err;
// 		console.log(result);
// 		res.render('deaths', { title: 'xyp', deathData: result});
// 	});
// });

// app.get('/graph', function(req, res){
// 	db.query("SELECT * FROM deaths", function (err, result) {
// 		if (err) throw err;
// 		console.log(result);
// 		res.render('graph', { title: 'graph', graphData: result});
// 	});
// });

// Ganeshan's code
// app.post('/addIncidents', function(req, res, next) {
// 	var beach = req.body.beach;
// 	var city = req.body.city;
// 	var email = req.body.email;
// 	var detail = req.body.detail;
// 	var sql = `INSERT INTO incidents (beach, city, email, detail, reported_at) VALUES ("${beach}", "${city}", "${email}", "${detail}", NOW())`;
// 	db.query(sql, function(err, result) {
// 		if (err) throw err;
// 		console.log('record inserted');
// 		res.render('addIncidents');
// 	});
// });

 
// app.listen(3000);
// console.log('Node app is running on port 3000');
