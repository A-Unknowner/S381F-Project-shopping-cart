# Group members
LI Chi Fung (13031837) (s1303183@live.hkmu.edu.hk), \
YEUNG Ho Yin Tommy (13024570) (s1302457@live.hkmu.edu.hk),\
Wong Ping Kuen (13031493) (s1303149@live.hkmu.edu.hk),\
Rai Jon (12749417) (s1274941@live.hkmu.edu.hk)


## S381F Group Project (Shopping Cart)

### Detail for test Account :
#### { Username : 'teacher', 
#### Password : '123', 
#### email : 'teacher@live.com', 
#### img }


## Environment
node v14.15.1+



## Install
1. npm install 
2. npm start

*** 
##### URL: https://s381f-shopping-cart.herokuapp.com/ 

*Login (User login with username and password)\
-username\
-password

(User will get and pop-out message if an incorrect password or username is enter.)


*Create (user sign up to create an account)\
-username\
-password\
-email\
-password

 (user can create account by clicking the sign up button next to the box of sign in, once user clicks it an sign up UI
 will appear requiring user to enter username, password, email and password afterwards it will let user enter into homepage after successfully sign up)

*update (user can edit their account information)\
-img\
(User can upload image in profile edit)\
*delete (user can delete their account)

*search (user can search item)
This function is in homepage user can search for item in the search bar by the item name but they will have to follow wether the item name is in UPPER-CASE or lower-case.

*display (user can see the item that they searched) function will show user, searched item on under the search bar.

*** 
## API
|                           URL                              |                          description                    |
|:----------------------------------------------------------:|:-------------------------------------------------------:|
| https://s381f-shopping-cart.herokuapp.com/api/item/        | display all item with json object                       |
| https://s381f-shopping-cart.herokuapp.com/api/item/Apple   | display (item) Apple with json object                   |
| https://s381f-shopping-cart.herokuapp.com/api/user/teacher | display (user) teacher all information with json object |


we use API as for HTTP, the API will gets user information and help to communicate with other device 

***
### Directory structure
├── README.md \
├── server.js \
├── package.json \
├── publice \
│   └── css \
│       ├── home.css \
│       ├── index.css \
│       ├── profile.css \
│       └── profileEdit.css \
├── views \
│   ├── profile.ejs \
│   ├── home.ejs \
│   ├── login.ejs \
│   └── profileEdit.ejs \
└── node_modules


***
 
 
 TODO :
  Edit Cart item    
  extend the item list
  payment function
  refund