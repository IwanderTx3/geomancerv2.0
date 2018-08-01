var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//const Promise = require('bluebird')
var mustacheExpress = require('mustache-express');
var session = require('express-session');
/*let initOption = {
    promiseLib: Promise
};*/
//let pgp =require('pg-promise')(initOption);
let connectionString = 'postgres://localhost:5433/geomancer';
//let  = require('./models/index'); = pgp(connectionString);
var cors = require('cors')
var app=express();
//var index = require('./routes/index');
var mappublisher = require('./routes/mappublisher')
var db = require('./models/index');
var User = db.users
app.use(express.static('public'))
//app.use('/users',users);
app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));
app.use('/mappublisher',mappublisher)
app.engine('mustache', mustacheExpress());
app.set('views','./views');
app.set('view engine', 'mustache');
app.set('port',3000);
app.use(cors());
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret:'imlost',
    resave: false,
    saveUninitialized: false,
    cookie:{
        expires: 86400000
    }
}));


app.get('/',function(req,res) {res.render('login')})
app.get('/control',function(req,res){res.render('controlPanel',{username : req.session.user})})
app.get('/login',function(req,res) {res.render('login')})
app.get('/signup',function(req,res) {res.render('signup')})
app.get('/creation',function(req,res) {res.render('creation',{username : req.session.user})})
app.get('/world-viewer', function (req, res, next) {
    console.log('###################')
    db.map_publishers.findAll({
        attributes: ['id', 'mapname','createdAt']
    })
        .then(function(maps){
            console.log('###################')
            res.render('world-viewer',{username : req.session.user,maps:maps})
        })
        .catch((error) => { 
            console.log(error)
            //return 
            res.json({
            error: true,
            data: [],
            error: error})})
            })
    
    
app.get('/darkside',function(req,res) {res.render('darkside',{username : req.session.user})})
app.get('/postmap',function(req,res) {res.redirect('/creation')})

app.route('/login')
    .post((req,res) => {
        var username = req.body.username;
        var password = req.body.password;
        User.findOne({where: {username : username }})
        .then(function (user){
            if (!user) {
                console.log('wrong')
                res.redirect('/signup');
            }
 //           else if (!user.validPassword(password)){
 //               console.log('try again')
 //               res.redirect('/signup');
 //           }
            else {
                req.session.user = user.dataValues;
                res.redirect('/control');
            }
        });
    });


app.get('/logout', (req, res) => {
        req.session.destroy();
        res.clearCookie('user_sid');
        res.redirect('/');
    });


//app.get('/*',function(req,res){res.render('home')})
app.listen(3000, () => console.log('The Geomancer is listening!'))
