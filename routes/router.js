const router = require('express').Router();
require('dotenv').config();
// const database = include('DBConnectionMongoDB');
const MongoStore = require('connect-mongo');
//const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
const expireTime = 60 * 60 * 1000;  // session expire time, persist for 1 hour. 

const bcrypt = require('bcrypt');
const saltRounds = 12;

//Cloudinary
const database = include('databaseConnectionMongoDB');
var ObjectId = require('mongodb').ObjectId;


const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const mongodb_database = process.env.REMOTE_MONGODB_DATABASE;
const userCollection = database.db(mongodb_database).collection('users');
const petCollection = database.db(mongodb_database).collection('pets');
const userPicCollection = database.db(mongodb_database).collection('userPicture');

const Joi = require("joi");
const mongoSanitize = require('express-mongo-sanitize');

router.use(mongoSanitize(
    {replaceWith: '%'}
));

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
console.log("index page hit");
	try {
		const users = await userCollection.find().project({first_name: 1, last_name: 1, email: 1, _id: 1}).toArray();

		if (users === null) {
			res.render('error', {message: 'Error connecting to MongoDB'});
			console.log("Error connecting to user collection");
		}
		else {
			users.map((item) => {
				item.user_id = item._id;
				return item;
			});
			console.log(users);

			res.render('index', {allUsers: users});
		}
	}
	catch(ex) {
		res.render('error', {message: 'Error connecting to MySQL'});
		console.log("Error connecting to MySQL");
		console.log(ex);
	}
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


router.get('/showPics', async (req, res) => {
	console.log("picture page");
	try {
		let user_id = req.query.id;
		console.log("userId: "+user_id);

		// Joi validate
		const schema = Joi.object(
			{
				user_id: Joi.string().alphanum().min(24).max(24).required()
			});
		
		const validationResult = schema.validate({user_id});
		if (validationResult.error != null) {
			console.log(validationResult.error);

			res.render('error', {message: 'Invalid user_id'});
			return;
		}				
		const pics= await userPicCollection.find({"user_id": new ObjectId(user_id)}).toArray();

		if (pics === null) {
			res.render('error', {message: 'Error connecting to MongoDB'});
			console.log("Error connecting to userModel");
		}
		else {
			pics.map((item) => {
				item.pic_id = item._id;
				return item;
			});			
			console.log(pics);
			res.render('images', {allPics: pics, user_id: user_id});
		}
	}
	catch(ex) {
		res.render('error', {message: 'Error connecting to MongoDB'});
		console.log("Error connecting to MongoDB");
		console.log(ex);
	}
});

// router.get('/login', (req,res) => {
//     res.render('tempLogin', {title: "Login Page"})
// });

module.exports = router;
