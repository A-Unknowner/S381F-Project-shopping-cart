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
const GridFSBucket = require('mongodb/lib/gridfs-stream');


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
app.get('/', (req, res) => {
    if (!req.session.authenticated) {
        console.log("...Not authenticated; directing to login");
        res.status(200).redirect("/login");
    } else {

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
app.get('/login', (req, res) => {
    if (req.session.authenticated) {
        console.log("...Hello, welcome back");
        res.status(200).redirect("/home");
        console.log("...Welcome to login page");
    } else {

        res.status(200).render('login', {
            fail: false,
            message: ``,
            username: ``,
            username_new: ``,
            password: ``,
            email: ``
        });

    }

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

    res.status(200).redirect('/');

})

app.get("/profile", (req, res) => {

    console.log("Welcome to edit user profile page");
    const criteria = {};
    criteria["username"] = req.session.userid;
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        const db = client.db(dbName);
        findDocument(db, criteria, 'user', (docs) => {
            client.close();
          res.status(200).render("profile",{user:docs[0]});  

        })
    })
});



app.post("/profile", (req, res) => {

    console.log("Update user profile");

})


app.use("/login", (req, res, next) => {

    const client = new MongoClient(mongourl);

    // sign up
    if (req.fields.new_acct_uname) {

        if (req.fields.new_acct_password ==
            req.fields.new_acct_confrim_password) {

            client.connect((err) => {

                assert.equal(null, err);

                const db = client.db(dbName);

                findDocument(db, {}, "user", (docs) => {

                    client.close();

                    if (docs.length != 0) {

                        var email_array = [];

                        var username_array = [];

                        for (var i of docs) {

                            email_array.push(i.email);

                            username_array.push(i.username);

                        }

                        if (email_array.includes(req.fields.new_email) == true &&
                            username_array.includes(req.fields.new_acct_uname) == false) {

                            console.log("This email already used");
                            res.status(200).render('login', {
                                fail: true,
                                message: `This email already used`,
                                username: ``,
                                username_new: `${req.fields.new_acct_uname}`,
                                password: ``,
                                email: `${req.fields.new_email}`
                            });


                        } else if (email_array.includes(req.fields.new_email) == false &&
                            username_array.includes(req.fields.new_acct_uname) == true) {

                            console.log("This username already used");
                            res.status(200).render('login', {
                                fail: true,
                                message: `This username already used`,
                                username: ``,
                                username_new: `${req.fields.new_acct_uname}`,
                                password: ``,
                                email: `${req.fields.new_email}`
                            });


                        } else if (email_array.includes(req.fields.new_email) == true &&
                            username_array.includes(req.fields.new_acct_uname) == true) {

                            console.log("This username and email already used");
                            res.status(200).render('login', {
                                fail: true,
                                message: `This username and email already used`,
                                username: ``,
                                username_new: `${req.fields.new_acct_uname}`,
                                password: ``,
                                email: `${req.fields.new_email}`
                            });

                        } else if (email_array.includes(req.fields.new_email) == false &&
                            username_array.includes(req.fields.new_acct_uname) == false) {

                            next();

                        }

                    }
                })

            })

        } else { console.log("The both password are not match"); }


        // login
    } else {

        client.connect((err) => {

            let criteria = {};

            var email_regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

            if (req.fields.username.match(email_regex)) {

                criteria["email"] = req.fields.username;

            } else {

                criteria["username"] = req.fields.username;

            }
            assert.equal(null, err);

            const db = client.db(dbName);

            findDocument(db, criteria, "user", (docs) => {

                client.close();

                if (docs.length != 0) {

                    let auth_password = "";

                    for (var i of docs) {

                        auth_password = i.password;
                    }

                    bcrypt.compare(req.fields.password, auth_password, (err, result) => {

                        assert.equal(null, err);

                        if (result == true) {

                            req.session.authenticated = true;

                            req.session.userid = req.fields.username;

                            res.status(200).redirect("/");

                        } else {

                            req.session.authenticated = false;

                            // For security reason, do not needed to give to must information to the user.
                            console.log("The username or password incorrect");

                            res.status(200).render('login', {
                                fail: true,
                                message: `The username or password incorrect`,
                                username: `${req.fields.username}`,
                                username_new: ``,
                                password: `${req.fields.password}`,
                                email: ``
                            });

                        }

                    });



                } else {

                    req.session.authenticated = false;

                    // For security reason, do not needed to give to must information to the user.
                    console.log("The username or password incorrect");
                    res.status(200).render('login', {
                        fail: true,
                        message: `The username or password incorrect`,
                        username: `${req.fields.username}`,
                        username_new: ``,
                        password: `${req.fields.password}`,
                        email: ``
                    });

                    // res.status(200).redirect("/");

                }

            });

        });

    }
});

// create user account
app.post("/login", (req, res, next) => {

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

                console.log("Created an account");

            });

        })

    });

});

app.get('/*', (req, res)=>{
    res.status(404).render("NotFound", {message: `${req.path} - Unknown request!`})
});

app.use(express.static("public"));

app.listen(process.env.PORT || 8099);
