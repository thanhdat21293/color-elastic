const express = require ('express');
const expressVue = require ('express-vue');
const app = express();
const bodyParser = require ("body-parser");
const path = require ('path');
const async = require ('async');
const elas = require ("../elastic/index");
const passport = require('passport');
const auth = require ('../passport/auth');
const session = require('express-session');
const NodeCache = require( "node-cache" );
const collection = require('../models/collection');
const account = require('../models/register');
const shortid = require('shortid');
const moment = require('moment');
const likedislike = require('../models/like_dislike');

const myCache = new NodeCache( { stdTTL: 0, checkperiod: 600 } );

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(session({
  cookie: { maxAge: (3600 * 1000) },
  unser : 'destroy',
  secret: 'JackCodeHammer',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}))


app.use ('/public', express.static ('../public'));

app.engine ('vue', expressVue);

app.set ('view engine', 'vue');

app.set ('views', path.join (__dirname, '/../views'));
app.set ('vue', {
    componentsDir: path.join (__dirname, '../views', 'components'),
    defaultLayout : 'layout'
});

app.use (bodyParser.urlencoded ({
    extended: true
}));

app.use (bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());
app.use(auth.checkAuthentication);

//------------Set up Passport--------------------
require('../passport/passport')(passport);

//------------Set up Passport-local strategy--------------------
require('../passport/passport-local/passport_local')(passport);

//------------Set up Facebook OAuth 2.0 with Passport--------------------
require('../passport/facebook/passport_facebook')(passport);

//------------Set up Google OAuth 2.0 with Passport--------------------
require('../passport/google/passport_google')(passport);

//------------Set up router --------------------
//require('../router/router')(app, passport);


//Check hex code
function isHexaColor(sNum) {
    return (typeof sNum === "string") && sNum.length === 6
        && !isNaN(parseInt(sNum, 16));
}

function merge(item, cb){
    collection.addCollection(item)
    .then (data => {
        cb(null,data);
    },
    error => {
        console.log(error);
        cb (null, error);
    });
}


//------------Set up router --------------------
app.get ('/all', (req, res) => {
        let user_id = 0;
        if(req.session.user.id) {
            user_id = req.session.user.id;
        }
        collection.getAllCollection (user_id)
        .then (result => {
            res.json({data: result})
        });
    });


    app.get ('/detailios/:id', (req, res) => {
        let user_id = 0;
        if(req.session.user.id) {
            user_id = req.session.user.id;
        }
        let id = req.params.id;
        collection.getCollectionById (id, user_id)
        .then ( (data) => {
            res.json({data: data})
        });
    });

    app.get('/relatedios', (req, res) => {
        let id = req.query.id;
        let id_parent = req.query.idparent;
        let hex = "#" + id;
        let arr = [];
        collection.getColorRelated ( hex, id_parent )
        .then ( data => {
            res.json ({data: data});
        });
    });


    app.post('/register', (req, res) => {
        let email    = req.body.email;
        let password = req.body.password;
        let status   = {};
        account.register(email, password)
            .then(succeed => {
                if (succeed) {
                    status = true;
                } else {
                    status = false;
                }
                res.json({status: status, islogin: req.session.login, users: req.session.user.email || ''});
            });
    });

    app.post('/addnewpalette', (req, res) => {

        let user_id = req.session.user.id || 'null';
        let name = req.body['name'];
        let description = req.body['description'];
        let color1 = req.body['color1'];
        let color2 = req.body['color2'];
        let color3 = req.body['color3'];
        let color4 = req.body['color4'];
        let color5 = req.body['color5'];

        let error = '';

        if(name.trim().length < 1){
            error += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Name required <br>';
        }
        if(!isHexaColor(color1)){
            error += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Color 1 invalid <br>';
        }
        if(!isHexaColor(color2)){
            error += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Color 2 invalid <br>';
        }
        if(!isHexaColor(color3)){
            error += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Color 3 invalid <br>';
        }
        if(!isHexaColor(color4)){
            error += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Color 4 invalid <br>';
        }
        if(!isHexaColor(color5)){
            error += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Color 5 invalid <br>';
        }



        if(error.length > 0){
            res.json({
                errMsg: error,
                islogin : req.session.login,
                users : req.session.user.email || ''
            })
        }else{
            let id = shortid.generate();
            let color = [{
                id: id,
                name: name,
                color1: '#' + color1,
                color2: '#' + color2,
                color3: '#' + color3,
                color4: '#' + color4,
                color5: '#' + color5,
                date: moment().format("DD-MM-YYYY HH:mm:ss"),
                description: description,
                id_user: user_id,
                like: 0,
                dislike:0,
                share: 0
            }];
            let islogin = req.session.login;
            let users = req.session.user.email || '';

            myCache.del( "homenull");
            myCache.del( "home" + user_id);
            myCache.del( "dataSortByLikenull");
            myCache.del( "dataSortByLike" + user_id);

            async.mapSeries (color, merge, (err, rs) => {
                res.json({
                    errMsg: rs[0],
                    islogin : islogin,
                    users : users
                })
            });
        }
    });

    app.get("/logined", (req, res) => {
        let data = {};
        let user_id = req.session.user.id || 'null';

        if (req.session.login) {
            myCache.del( "homenull");
            myCache.del( "home" + user_id);
            myCache.del( "dataSortByLikenull");
            myCache.del( "dataSortByLike" + user_id);
            data = {'islogin': true, 'users': req.session.user.email || ''};

        } else {
            data = {'islogin': false};
        }
        res.json(data);
    });

    //------------Passport-Local Strategy--------------------
    app.post("/login", passport.authenticate('local', {successRedirect: '/logined', failureRedirect: '/logined'}));

    //------------Facebook OAuth 2.0 with Passport--------------------
    app.get('/login/facebook',
        passport.authenticate('facebook', {scope: ['email']}
        ));

    // handle the callback after facebook has authenticated the user
    app.get('/login/facebook/callback', passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/'
        })
    );

    //------------Google OAuth 2.0 with Passport--------------------
    app.get('/login/google',
        passport.authenticate('google', {scope: ['email', 'profile']}
        ));

    // handle the callback after facebook has authenticated the user
    app.get('/login/google/callback', passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        })
    );

    app.get('/logout', (req, res) => {
        let session   = req.session;
        let user_id = req.session.user.id || 'null';

        myCache.del( "homenull");
        myCache.del( "home" + user_id);
        myCache.del( "dataSortByLikenull");
        myCache.del( "dataSortByLike" + user_id);

        session.login = false;
        session.user  = {};
        session.destroy(function (err) {
            res.json({islogin: false, users: ''});
        });
    });

    app.post('/likedislike', (req, res) => {
        if (req.session.user.id) {
            let status = req.body['action'];
            let user_id = req.session.user.id || 'null';
            let collection_id = req.body['collection_id'];
            likedislike.clickLikeDislike(collection_id, user_id, status)
                .then(data => {
                        collection.getCollection(data, user_id)
                            .then((data1) => {

                                myCache.del( "homenull");
                                myCache.del( "home" + user_id);
                                myCache.del( "dataSortByLikenull");
                                myCache.del( "dataSortByLike" + user_id);

                                res.json(data1[0])
                            });
                    },
                    failed => {
                        res.json({error: 'Failed'});
                    });
        } else {
            //console.log('Unauthorized');
            res.json({error: 'You must login to like or dislike'});
        }
    });

    app.get('/test', (req, res) =>{
        res.json({errMsg: 'ok IOS 1'});
    })

  app.listen(4001, () => {
    console.log("Express running at port 4001");
  });