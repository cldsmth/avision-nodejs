var express = require('express'),
	app = express(),
	port = process.env.PORT || 3001,
	mongoose = require('mongoose'),
	Admin = require('./api/models/adminModel'), //created model admin here
	bodyParser = require('body-parser'),
	cors = require('cors');
	
global.__basedir = __dirname;
global.__dir_admin = __basedir + "/uploads/admin/";

//mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/avision');

app.use(bodyParser.json()); //for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); //for parsing application/xwww-form-urlencoded
app.use(cors()); //cross origin

var adminRoutes = require('./api/routes/adminRoutes'); //importing admin route
adminRoutes(app); //register the admin route

app.listen(port);
console.log("AVISION RESTful API server started on: " + port);

app.use(function(req, res) {
  res.status(404).send({status: 404, message: req.originalUrl + " not found"});
});