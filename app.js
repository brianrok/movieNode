var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var morgan = require('morgan');
var multipart = require('connect-multiparty');
var fs = require('fs');
var port = process.env.PORT || 3000;
var app = express();
var mongoUrl = 'mongodb://localhost/imooc';

mongoose.connect(mongoUrl);
var modelsPath = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file){
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if(stat.isFile()) {
            if(/{.*}\.(js|coffee)/.test(file)) {
                require(newPath);
            } else if (stat.isDirectory()) {
                walk(newPath);
            }
        }
    });
};
walk(modelsPath);

app.set('views', './app/views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(multipart());
app.use(session({
    secret: 'imooc',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        url: mongoUrl,
        collection: 'sessions'
    })
}));
if ('development' === app.get('env')) {
    app.set('showStaticError', true);
    app.use(morgan('combined'));
    app.locals.pretty = true;
    mongoose.set('debug', true);
}

require('./config/routes')(app);
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);

console.log('Movie node started on ' + port);

