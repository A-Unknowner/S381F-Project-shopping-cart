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
    console.log("Welcome to / page");
    if (!req.session.authenticated) {
        console.log("...Not authenticated; directing to login");
        console.log("No session recorded");
        res.status(200).redirect("/login");
    } else {
        console.log(`Hello ${req.session.userid}, welcome back /`);
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
const deleteDocument = (db, criteria, collection, callback) => {
    cursor = db.collection(collection).deleteOne(criteria, (error, results) => {
        if (error) throw error;
        callback(results);
    });
}
const updateDocument = (db, criteria, collection, callback) => {
    cursor = db.collection(collection).updateOne(criteria, (error, results) => {
        if (error) throw error;
        callback(results);
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
    console.log("Welcome to login page");
    if (req.session.authenticated) {
        console.log(`Pass login!`);
        console.log(`Hello ${req.session.userid}, welcome back login`);
        res.status(200).redirect("/home");
    } else {
        console.log(`Waiting sign in or sign out!`);
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
    if (req.session.authenticated) {
        console.log(`Hello ${req.session.userid}, welcome back home`);
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            const db = client.db(dbName);

            findDocument(db, {}, "item", (docs) => {
                client.close();

                // for (var i of docs){
                //     res.status(200).render("home", { itemList : i });
                // }
                res.status(200).render("home", { items : docs});
            });
        });

    } else {
        console.log("No session recorded");
        res.status(200).redirect('/');
    }
})
// logout function
app.get("/logout", (req, res) => {
    req.session = null;
    req.authenticated = false;
    res.status(200).redirect('/');
})
app.get("/profile", (req, res) => {
    if (req.session.authenticated) {
        console.log("Welcome to edit user profile page");
        const criteria = {};
        criteria["username"] = req.session.userid;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            const db = client.db(dbName);
            findDocument(db, criteria, 'user', (docs) => {
                client.close();
                res.status(200).render("profile", { user: docs[0] });
            })
        })
    } else {
        res.status(200).redirect('/');
    }
});

app.get("/profileEdit", (req, res) => {
    if (req.session.authenticated) {
        console.log("Welcome to edit user profile page");
        const criteria = {};
        criteria["username"] = req.session.userid;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            const db = client.db(dbName);
            findDocument(db, criteria, 'user', (docs) => {
                client.close();
                res.status(200).render("profileEdit", { user: docs[0] });
            })
        })
    } else {
        res.status(200).redirect('/');
    }
});

app.get("/delete", (req, res) => {

    console.log("Delete Message");

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
        criteria["role"] = "VIP1";
        criteria["icon"] = {
            "type": "png",
            "base64": "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"
        }
        client.connect((err) => {
            assert.equal(null, err);
            const db = client.db(dbName);
            InsertDocument(db, criteria, "user", (docs) => {
                client.close();
                console.log("Created an account");
                
                req.session.authenticated = true;
                req.session.userid = req.fields.new_acct_uname;
                res.status(200).redirect("/");
            });
        })
    });
});
//css
app.use(express.static("public"));
//404 Not Found
app.get('/*', (req, res) => {
    res.status(404).render("NotFound", { message: `${req.path} - Unknown request!` })
});
app.listen(process.env.PORT || 8099);
