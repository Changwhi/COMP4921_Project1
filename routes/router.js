const router = require('express').Router();
require('dotenv').config();
// const database = include('DBConnectionMongoDB');
const MongoStore = require('connect-mongo');
//const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
const expireTime = 60 * 60 * 1000;  // session expire time, persist for 1 hour. 

const bcrypt = require('bcrypt');
const saltRounds = 12;

//router.use(mongoSanitize(
//    {replaceWith: '%'}
//));

//*** Temp users array for future SQL held accounts */
var users = []; 

// ****** MongoDB sessions *****// 
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster1.5f9ckjd.mongodb.net/COMP4921_Project1_DB?retryWrites=true&w=majority`,
    crypto: {
        secret: mongodb_session_secret
    }
});

router.use(session({
    secret:node_session_secret,
    store: mongoStore, 
    saveUninitialized: false,
    resave: true
}
));

//* User is brought to index page to login or sign up */
router.get('/', async (req, res) => {
    res.render('main');
});
//* Successful or unsuccessful login*/
router.post('/loggingin', (req,res) => {
    var email = req.body.email;
    var password = req.body.password;

    for (i = 0; i < users.length;i++) {
        if (users[i].email == email) {
            if (bcrypt.compareSync(password, users[i].password)) {
                req.session.email = email;
                req.session.cookie.maxAge = expireTime;
                res.redirect('/tempLoggedIn');
                return;
            }
        }
    }
    //User & PW combo not found.
    res.redirect("/index");
});


//** Render setupTempUser which is /createUser originally, renamed for temp use. */
router.get('/createUser', (req,res) => {
    //TODO render awesome custom & stylized Sign Up page by Changwhi
    res.render("tempUserSetup", {title: "Sign up Page"});
});

//* Middleware for hashing password and pushing into temp DB. */
router.post('/submitUser', (req,res) => {
    var email = req.body.email;
    var password = req.body.password;
    var hashedPassword = bcrypt.hashSync(password, saltRounds);
    users.push({ email: email, password: hashedPassword });
    res.render('index')
});

router.get('/tempLoggedin', (req,res) => {
    var html = `
    You are logged in!
    `;
    res.send(html);
});

// router.get('/login', (req,res) => {
//     res.render('tempLogin', {title: "Login Page"})
// });

module.exports = router;
