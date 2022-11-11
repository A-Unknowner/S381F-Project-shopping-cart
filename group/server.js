//HTML 
//const html = require('html');
const url = require('url');
const assert = require('assert');
//File
const fs = require('fs'); 
const formidable = require('express-formidable');
//MongoDB
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://yliustudy:yliustudy@cluster0.gco0kvr.mongodb.net/?retryWrites=true&w=majority'; 

const dbName = 'test';

const express = require('express');
const app = express();
const session = require('cookie-session');

const bodyParser = require('body-parser');

const { Buffer } = require('safe-buffer');

//Main Body
app.set('view engine', 'ejs');
app.use(formidable());

//Middleware
app.use(bodyParser.json());
//Cookie
app.use(session({
    userid: "session",  
    keys: ['th1s!sA5ecretK3y1'],
    //maxAge: 90 * 24 * 60 * 60 * 1000
}));

//alway checking do user are login before
// app.use((req, res, next) => {
//     console.log("...Checking login status");
//     if (req.session.authenticated){
//       next();
//     } else {
//       res.redirect("/login");
//     }
// });

//handling requests
app.get('/', (req, res)=>{
    if(!req.session.authenticated){
        console.log("...Not authenticated; directing to login");
        res.redirect("/login");
    }
    console.log("...Hello, welcome back");
    handle_Find(req, res, {});
});

// check connect
const handle_Find = (req, res, criteria) =>{
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
        // //callback()
        // findDocument(db, {}, (docs)=>{
            client.close();
            console.log("Closed DB connection.");
        //     res.status(200).render('home', {name: `${req.session.userid}`, ninventory: docs.length, inventory: docs});
        // });

    });
}

const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('user_account').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err, docs)=>{
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        callback(docs);
    });
}

//login
app.get('/login', (req, res)=>{
    console.log("...Welcome to login page");
    res.sendFile(__dirname + '/views/index.html');
    res.status(200).render("index");
});


app.listen(process.env.PORT || 8099);