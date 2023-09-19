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
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster1.5f9ckjd.mongodb.net/COMP4921_Project1_DB?retryWrites=true&w=majority/sessions`,
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

router.get('/', async (req, res) => {
      res.send("<h1>Hello word <!h1>");
});


//** Render setupTempUser which is /createUser originally, renamed for temp use. */
router.get('/createUser', (req,res) => {
    res.render("setupTempUser", {title: "User Creation"});
});

router.post('/submitUser', (req,res) => {
    var username = req.body.username;
    var password = req.body.password;

    var hashedPassword = bcrypt.hashSync(password, saltRounds);
    users.push({ username: username, password: hashedPassword });
});



module.exports = router;
