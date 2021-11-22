require('dotenv').config();

var crypto = require("crypto");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var catalogRouter = require('./routes/catalog');// Import routes for "catalog" area of site
var compression = require('compression');
var helmet = require('helmet');
var app = express();
app.locals.moment = require('moment');
//Import the mongoose module
var mongoose = require('mongoose');
//console.log(process.env.RANDOM)
//Set up default mongoose connection
var mongoDB = process.env.URL;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
//app.use((req, res, next) => {
  //res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  //console.log(res.locals.cspNonce)
  //next();
//(req, res) => `'nonce-${res.locals.cspNonce}'` put this inside script-src
//});
app.use(helmet({
  contentSecurityPolicy:{
    directives:{
      "default-src":["'self'"],
      "script-src":["'self'","'report-sample'","'unsafe-inline'",'https://code.jquery.com/jquery-3.6.0.js',"https://canvasjs.com/assets/script/canvasjs.min.js","https://code.jquery.com/jquery-3.5.1.slim.min.js","'sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj'","https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js","'sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV'","https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@5.6.0/main.min.js"],
      "style-src": ["'self'","'report-sample'","https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css","'unsafe-inline'","https://cdn.jsdelivr.net/npm/fullcalendar-scheduler@5.6.0/main.min.css"],
      "object-src":["'none'"],
      "font-src":["'self'", "data:"],
      "img-src":["'self'","https://i.ibb.co/ data:"],
      "report-uri":["https://a005ed3c3b6c22373aa7da7fa61d83a6.report-uri.com/r/d/csp/reportOnly"],
      "form-action":["'self'"],
      "base-uri":["'self'"],
      "frame-ancestors":["'self'"],
      "media-src":["'self'"],
      upgradeInsecureRequests:[],
      "worker-src":"'none'",
      "connect-src":"'self'",
      "child-src":"'self'",
      "frame-src":"'self'",
      "prefetch-src":"'self'",
      "manifest-src":"'self'",

    },
  }
}
));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>{
  console.log(req.headers['x-forwarded-for']   );
  res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept,Authorization");
  next();
});
app.use('/', indexRouter);
app.use('/catalog',catalogRouter);
<<<<<<< HEAD
app.use(function (req,res,next){
  console.log(req.ip)
})
=======
>>>>>>> main
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
