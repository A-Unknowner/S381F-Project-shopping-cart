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

const mongourl = 'mongodb+srv://testuser0123:PAssw0rd@cluster0.xz69qgb.mongodb.net/?retryWrites=true&w=majority'; 

const dbName = 'group_project';

const express = require('express');
const app = express();
const session = require('cookie-session');

const bodyParser = require('body-parser');

const { Buffer } = require('safe-buffer');

// Password encryption algorithm
var bcrypt = require('bcryptjs');
const { nextTick } = require('process');


//Main Body
app.set('view engine', 'ejs');
app.use(formidable());

//Middleware
app.use(bodyParser.json());
//Cookie
app.use(session({
    userid: "session",  
    keys: ['th1s!sA5ecretK3y1'],
    maxAge: 60 * 1000 * 10 // The session will be expired 10 mins later
}));



//handling requests
app.get('/', (req, res)=>{
    if(!req.session.authenticated){
        console.log("...Not authenticated; directing to login");
        res.status(200).redirect("/login");
    } else{

        console.log("...Hello, welcome back");
        res.status(200).redirect("/home");

    }


});



const InsertDocument = (db, criteria, collection, callback) => {


    db.collection(collection).insertOne(criteria, (error, results) => {

        if (error) throw error;

        callback(results);

    });

}


const findDocument = (db, criteria, collection, callback) => {

    cursor = db.collection(collection).find(criteria);

    cursor.toArray((err, docs) => {

        assert.equal(null, err);

  
        callback(docs);

    });

}

const passwordEncryption = (password, callback) => {

    const salt_round = 10;

    bcrypt.genSalt(salt_round, (saltError, salt) => {

        if (saltError) throw saltError;

        bcrypt.hash(password, salt, (hashError, hashed_password) => {

            if (hashError) throw hashError;

            callback(hashed_password);

        })

    })

    console.log("Encryption finished");

}

//login
app.get('/login', (req, res)=>{
    console.log("...Welcome to login page");
    //res.sendFile(__dirname + '/public/login.html');
    res.status(200).render("login");

});

app.get('/home', (req, res) => {

    console.log("Welcome to home page");

    res.status(200).render("home");

    //res.sendFile(__dirname + '/public/login.html');

})

// logout function
app.get("/logout", (req, res) => {

    req.session = null;

    req.authenticated = false;

    console.log("Hell");

    res.status(200).redirect('/');

})

app.use("/login", (req,res, next) => {

    console.log("Hello World1");

    const client = new MongoClient(mongourl);

    console.log("Hello World2");

    // sign up
    if (req.fields.new_acct_uname) {

        console.log("Hello World3");

        if (req.fields.new_acct_password == 
            req.fields.new_acct_confrim_password){
                
            console.log("Hello World4");

            client.connect((err) => {

                console.log("Hello World5");

                assert.equal(null, err);

                console.log("Hello World6");

                const db = client.db(dbName);

                console.log("Hello World7");

                findDocument(db, {}, "user", (docs) => {

                    console.log("Hello World8");

                    client.close();

                    console.log("Hello World9");

                    if (docs.length != 0){
                    
                        for (var i of docs) {

                            console.log("Hello World10");

                            if (i.email == req.fields.new_email){

                                console.log("This email already used");

                            } else if (i.username == req.fields.new_acct_uname){

                                
                                console.log("This username already used");

                            } else if (i.username != req.fields.new_acct_uname && 
                                    i.email != req.fields.new_email){

                                console.log("Hello World11");

                                next();

                            }

                        }

                    } else{

                        next();

                    }

                })

            })

        }else {console.log("The both password are not match");}


    // login
    } else {

        client.connect((err) => {

            let criteria = {};
           
            var email_regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

            if (req.fields.username.match(email_regex)){

                criteria["email"] = req.fields.username;

            }else{

                criteria["username"] = req.fields.username;
        
            }
            assert.equal(null, err);

            const db = client.db(dbName);

            findDocument(db, criteria, "user", (docs) => {

                client.close();

                for (var i of docs){

                    bcrypt.compare(req.fields.password, i.password, (err, result) => {

                        assert.equal(null, err);

                        if (result == true) {

                            req.session.authenticated = true;

                            req.session.userid = req.fields.username;

                            res.status(200).redirect("/");

                        }else {

                            req.session.authenticated = false;

                        }

                    }); 

                }
    
            });
 
        });

    }
});

// create user account
app.post("/login", (req,res, next) => {

    console.log("Hello");

    const client = new MongoClient(mongourl);

    criteria = {};

    passwordEncryption(req.fields.new_acct_password, (hashed) => {

        criteria["username"] = req.fields.new_acct_uname;

        criteria["email"] = req.fields.new_email;

        criteria["password"] = hashed;

        client.connect((err) => {

        assert.equal(null, err);

        const db = client.db(dbName);

            InsertDocument(db, criteria, "user", (docs) => {

                client.close();

                console.log("Inserted document");

            });

        })

    });

});

app.use(express.static(__dirname + "/public/css"));

app.listen(process.env.PORT || 8099);
