var express = require('express');
var path = require('path');
var db = require('./dbConfig');
// does it show up - yes it does!
var app = express();
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
	res.render('home', { title: 'Home' });
});

app.post('/', function(req, res, next) {
	var search = req.body.search;
	console.log(search);
	//db.query(`SELECT * FROM incidents WHERE beach="${search}"`, function (err, result) {
	db.query(`SELECT * FROM incidents WHERE MATCH description AGAINST ("${search}" WITH QUERY EXPANSION);`, function (err, result) {
		if (err) throw err;
		console.log(result);
		res.render('getIncidents', { title: 'xyz', incidentData: result});
	});
});

app.get('/videos', function(req, res, next) {
	res.render('videos', { title: 'Videos' });
});

app.get('/addIncidents', function(req, res, next) {
	res.render('addIncidents', { title: 'Home' });
});
 
app.get('/getIncidents', function(req, res){
	db.query("SELECT * FROM incidents", function (err, result) {
		if (err) throw err;
		console.log(result);
		res.render('getIncidents', { title: 'xyz', incidentData: result});
	});
});
 
app.get('/deaths', function(req, res){
	db.query("SELECT * FROM deaths", function (err, result) {
		if (err) throw err;
		console.log(result);
		res.render('deaths', { title: 'xyp', deathData: result});
	});
});

app.get('/graph', function(req, res){
	db.query("SELECT * FROM deaths", function (err, result) {
		if (err) throw err;
		console.log(result);
		res.render('graph', { title: 'graph', graphData: result});
	});
});

app.post('/addIncidents', function(req, res, next) {
	var beach = req.body.beach;
	var city = req.body.city;
	var email = req.body.email;
	var detail = req.body.detail;
	var sql = `INSERT INTO incidents (beach, city, email, detail, reported_at) VALUES ("${beach}", "${city}", "${email}", "${detail}", NOW())`;
	db.query(sql, function(err, result) {
		if (err) throw err;
		console.log('record inserted');
		res.render('addIncidents');
	});
});
 
app.listen(3000);
console.log('Node app is running on port 3000');
