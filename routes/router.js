const router = require('express').Router();
const database = include('DBConnectionMongoDB');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expireTime = 60 * 60 * 1000;  // session expire time, persist for 1 hour. 
//const mongoSanitize = require('express-mongo-sanitize');

//router.use(mongoSanitize(
//    {replaceWith: '%'}
//));

// ****** MongoDB sessions *****// 
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster1.5f9ckjd.mongodb.net/Sessions`,
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


module.exports = router;
