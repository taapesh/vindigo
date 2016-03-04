var express     = require('express');
var app         = express();
var cors        = require('cors');
var mongoose    = require('mongoose');
var morgan      = require('morgan');
var bodyParser  = require('body-parser');

// Connect to db
var database = require('./config/database');
mongoose.connect(database.url);

app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

// routes
require('./app/routes')(app);

app.all('/*', function(req, res, next) {
    // Send index.html to support HTML5Mode
    res.sendFile('index.html', { root: __dirname + '/public' });
});

// Start listening for requests
app.listen(3000);
console.log('Listening on port 3000');
