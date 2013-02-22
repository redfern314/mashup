
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , Facebook = require('facebook-node-sdk');

var app = express();
var mongoose = require('mongoose');
mongoose.connect((process.env.MONGOLAB_URI||'mongodb://localhost/mashup'));

var models = require('./models/models.js')
  , index = require('./routes/index');

var facebook_obj;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(process.env.COOKIE_SECRET));
  app.use(express.session());
  app.use(Facebook.middleware({appId: process.env.FB_APPID, secret: process.env.FB_SECRET}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var scope = {scope:['']};

app.get('/', index.index);
app.get('/login', Facebook.loginRequired(scope), index.login);
app.get('/logout', index.logout, index.index);
app.post('/edit', index.edit);
app.get('/addlist', index.loggedIn, index.addList);
app.get('/friends/:id', index.loggedIn, index.friends);;
app.post('/recommend', index.recommend);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
