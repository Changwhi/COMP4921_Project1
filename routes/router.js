const router = require("express").Router();
require("dotenv").config();
// const database = include('DBConnectionMongoDB');
const MongoStore = require("connect-mongo");
//const mongoSanitize = require('express-mongo-sanitize');
const session = require("express-session");
const expireTime = 24 * 60 * 60 * 1000; // session expire time, persist for 1 hour.

const bcrypt = require("bcrypt");
const saltRounds = 12;
// mySQL
const db_users = include('database/users');
const db_text = include('database/textInsert');
const db_url = include('database/links');


// Short UUID generator in base 64.
const generateShortUUID = include('routes/functions/ShortUUID')
const db_image = include('database/picture');
//
//validation
const validationFunctions = include('routes/functions/Validation');
//Cloudinary
const database = include("databaseConnectionMongoDB");
var ObjectId = require("mongodb").ObjectId;
const { v4: uuid } = require("uuid");
const passwordPepper = "SeCretPeppa4MySal+";
const crypto = require('crypto');

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const mongodb_database = process.env.REMOTE_MONGODB_DATABASE;
const userCollection = database.db(mongodb_database).collection("users");
const petCollection = database.db(mongodb_database).collection("pets");
const userPicCollection = database
  .db(mongodb_database)
  .collection("userPicture");

const Joi = require("joi");
const passwordSchema = Joi.object({
  password: Joi.string().pattern(/(?=.*[a-z])/).pattern(/(?=.*[A-Z])/).pattern(/(?=.*[!@#$%^&*])/).pattern(/(?=.*[0-9])/).min(12).max(50).required()
});
const mongoSanitize = require("express-mongo-sanitize");

router.use(mongoSanitize({ replaceWith: "%" }));

//router.use(mongoSanitize(
//    {replaceWith: '%'}Authentication (login with hashed passwords, password validation >= 10 characters with upper/lower, numbers, symbols)Authentication (login with hashed passwords, password validation >= 10 characters with upper/lower, numbers, symbols)Authentication (login with hashed passwords, password validation >= 10 characters with upper/lower, numbers, symbols)
//));

// ****** MongoDB sessions *****//
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster1.5f9ckjd.mongodb.net/COMP4921_Project1_DB?retryWrites=true&w=majority`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

router.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
  })
);
//testing
function setLoginStatus(req, res, next) {
  // Determine the login status (true if logged in, false otherwise)
  res.locals.isLoggedIn = req.session.authenticated === true;
  next();
}

//* User is brought to index page to login or sign up */
router.get("/", async (req, res) => {
  console.log("index page hit");
  const isLoggedIn = isValidSession(req)
  res.render("index", { isLoggedIn: isLoggedIn });
});



router.get("/login", async (req, res) => {
  const isLoggedIn = isValidSession(req)
  res.render("login", { isLoggedIn: isLoggedIn, message: null });

});

router.get('/logout', (req, res) => {
  console.log("Logging out");
  
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Failed to log out');
    }
    
    res.redirect('/login');
  });
});

router.get("/signup", async (req, res) => {
  console.log(req.query.invalid)
  var invalid = req.query.invalid === undefined ? true : req.query.invalid;
  res.render("signup", { invalid: invalid, isLoggedIn: false });

});


router.post("/loggingin", async (req, res) => {
  const passwordSchema = Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$')).required();
  var email = req.body.email;
  var password = req.body.password;
  var users = await db_users.getUsers();
  let user;
  
  for (let i = 0; i < users.length; i++) {
    if (users[i].email == email) {
      user = users[i];
      break;
    }
  }

  if (user === undefined) {
    res.render('login', { message: "Why did you enter the wrong email?!", isLoggedIn: false });
    return;
  } 

  const validationResult = passwordSchema.validate(password);

  if (validationResult.error) {
    let errorMsg = validationResult.error.details[0].message;
    
    if (errorMsg.includes("(?=.*[a-z])")) {
      errorMsg = "Password must have at least 1 lowercase.";
    } else if (errorMsg.includes("(?=.*[A-Z])")) {
      errorMsg = "Password must have at least 1 uppercase.";
    } else if (errorMsg.includes("(?=.*[!@#$%^&*])")) {
      errorMsg = "Password requires 1 special character.";
    } else if (errorMsg.includes("(?=.*[0-9])")) {
      errorMsg = "Password needs to have 1 number.";
    } else {
      errorMsg = null;
    }

    res.render("login", { message: errorMsg, isLoggedIn: false });
    return;
  }

  const isValidPassword = bcrypt.compareSync(password, user.hashed_password);

  if (isValidPassword) {
    req.session.userID = user.user_id;
    console.log(user.user_id, "+in loggedin");
    req.session.authenticated = true;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;
    res.render('index', { isLoggedIn: true });
  } else {
    req.session.authenticated = false;
    res.redirect('/login');
  }
});
//** CREATING THE USER SECTION */
//** Render tempUserSignup which is /createUser originally, renamed for temp use. */
//* Middleware for hashing password and pushing into mySQL DB*/
router.post("/submitUser", async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  var name = req.body.name;
  var hashedPassword = bcrypt.hashSync(password, saltRounds);
  
  const validationResult = passwordSchema.validate({ password });

  if (validationResult.error) {
    let errorMsg = validationResult.error.details[0].message;
    
    if (errorMsg.includes("(?=.*[a-z])")) {
      errorMsg = "Password must have at least 1 lowercase.";
    } else if (errorMsg.includes("(?=.*[A-Z])")) {
      errorMsg = "Password must have at least 1 uppercase.";
    } else if (errorMsg.includes("(?=[!@#$%^&*])")) {
      errorMsg = "Password requires 1 special character.";
    } else if (errorMsg.includes("(?=.*[0-9])")) {
      errorMsg = "Password needs to have 1 number.";
    }
    res.render("signup", { message: errorMsg, isLoggedIn: false });
    return;
  } else {
    var success = await db_users.createUser({ email: email, hashedPassword: hashedPassword, name: name });

    if (success) {
      res.redirect('/login');
      return;
    } else {
      res.render('error', { message: `Failed to create the user ${email}, ${name}`, title: "User creation failed" });
    }
  }
});



function isValidSession(req) {
  console.log("isValidSession")
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

function sessionValidation(req, res, next) {
  console.log("hit sessionValidation")
  if (!isValidSession(req)) {
    res.locals.isLoggedIn = req.session.authenticated === true;
    req.session.destroy();
    res.redirect('/login');
    return;
  }
  else {
    res.locals.isLoggedIn = req.session.authenticated === true;
    next();
  }
}

//******************************************** After logged in **************************
// router.use('/loggedin', sessionValidation);
router.get("/pic", async (req, res) => {
  res.send(
    '<form action="picUpload" method="post" enctype="multipart/form-data">' +
    '<p>Public ID: <input type="text" name="title"/></p>' +
    '<p>Image: <input type="file" name="image"/></p>' +
    '<p><input type="submit" value="Upload"/></p>' +
    "</form>"
  );
});

// router.post("/picUpload", upload.single("image"), function(req, res, next) {
//   let buf64 = req.file.buffer.toString("base64");
//   stream = cloudinary.uploader.upload(
//     "data:image/png;base64," + buf64,
//     function(result) {
//       //_stream
//       console.log(result);
//       res.send(
//         'Done:<br/> <img src="' +
//         result.url +
//         '"/><br/>' +
//         cloudinary.image(result.public_id, {
//           format: "png",
//           width: 100,
//           height: 130,
//           crop: "fit",
//         })
//       );
//     },
//     { public_id: req.body.title }
//   );
//   console.log(req.body);
//   console.log(req.file);
// });
//
// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
//


router.get("/showPics", sessionValidation, async (req, res) => {
  console.log("picture page");
  try {
    let user_id = req.session.userID;
    //req.query.id;
    console.log("userId: " + user_id);

    // Joi validate
    const schema = Joi.object({
      user_id: Joi.number().integer().min(1).required(),
    });

    const validationResult = schema.validate({ user_id });
    if (validationResult.error != null) {
      console.log(validationResult.error);

      res.render("error", { message: "Invalid user_id" });
      return;
    }
    console.log("Retrieving column and ", req.session.userID)
    let responseData = await db_image.getColumn({ user_id: user_id })
    console.log("in show pices", responseData[0])
    if (!responseData) {
      res.render('error', { message: `Failed to retrieve columns, ` })
    }
    res.render('images', { allPics: responseData[0], user_id: user_id });

  } catch (ex) {
    res.render("error", { message: "Error connecting to MongoDB" });
    console.log("Error connecting to MongoDB");
    console.log(ex);
  }
});

router.post("/addpic", sessionValidation, async (req, res) => {
  try {
    console.log("addpic form submit");

    let user_id = req.session.userID;

    const schema = Joi.object({
      user_id: Joi.number().integer().min(1).required(),
      name: Joi.string().alphanum().min(2).max(50).required(),
      comment: Joi.string().alphanum().min(0).max(150).required(),
    });
    const validationResult = schema.validate({
      user_id,
      name: req.body.pic_name,
      comment: req.body.comment,
    });
    if (validationResult.error != null) {
      console.log(validationResult.error);
      res.render("error", { message: "Invalid first_name, last_name, email" });
      return;
    }

    console.log("addColumn and ", req.session.userID)
    let responseData = await db_image.addColumn({ name: req.body.pic_name, user_id: user_id, comment: req.body.comment })
    if (!responseData) {
      res.render('error', { message: `Failed to create the image contents for:  ${req.body.pic_name}, `, title: "Adding Picture column failed" })
    }
    res.redirect(`/showPics?id=${user_id}`);
  } catch (ex) {
    res.render("error", { message: "Error connecting to MySQL" });
    console.log("Error connecting to MySQL");
    console.log(ex);
  }
});

router.get("/displayImage", async (req, res) => {
  console.log("dispalyImage page");
  try {
    let user_id = req.session.userID;
    let picture_UUID = req.query.uuid;
    let responseData = await db_image.getImage({ picture_UUID: picture_UUID })
    if (!responseData) {
      res.render('error', { message: `Failed to retrieve columns, ` })
    }
    const picture = responseData[0].filter(pic => pic.picture_UUID === picture_UUID);
    console.log("whats the picture", picture)
    if (req.session.authenticated) {
      var isLoggedIn = true;
    } else {
      var isLoggedIn = false;
    }

    res.render('displayImage', { allPics: picture, user_id: user_id, isLoggedIn: isLoggedIn });

  } catch (ex) {
    res.render("error", { message: "Error connecting to MongoDB" });
    console.log("Error connecting to MongoDB");
    console.log(ex);
  }
});


router.post("/setUserPic", sessionValidation, upload.single("image"), function(req, res, next) {
  let picture_UUID = req.body.pic_id;
  let user_id = req.session.userID;
  let buf64 = req.file.buffer.toString("base64");
  stream = cloudinary.uploader.upload(
    "data:image/octet-stream;base64," + buf64,
    async function(result) {
      try {
        console.log("userId: " + user_id);
        console.log("pcitureUUID: " + picture_UUID);
        const schema = Joi.object({
          user_id: Joi.number().integer().min(1).required(),
        });

        const validationResult = schema.validate({ user_id });
        if (validationResult.error != null) {
          console.log(validationResult.error);

          res.render("error", { message: "Invalid pet_id or user_id" });
          return;
        }

        console.log("cloudinary link", result.url)
        console.log("cloudinary link", result.public_id)
        console.log("cloudinary link", req.session.userID)
        let responseData = await db_image.insertImage({ link: result.url, public_id: result.public_id, picture_UUID: picture_UUID })
        if (!responseData) {
          res.render('error', { message: `Failed to create the image contents for` })
        }
        res.redirect(`/showPics?id=${user_id}`);
        // }
      } catch (ex) {
        res.render("error", { message: "Error connecting to MongoDB" });
        console.log("Error connecting to MongoDB");
        console.log(ex);
      }
    },
  );
  console.log(req.body);
  console.log(req.file);
});


router.get('/deletePics', sessionValidation, async (req, res) => {
  try {
    console.log("delete image");
    let user_id = req.session.userID;
    let picture_UUID = req.query.picture_UUID;
    console.log(picture_UUID)
    const schema = Joi.object(
      {
        user_id: Joi.number().integer().min(1).required(),
      });
    const validationResult = schema.validate({ user_id });
    if (validationResult.error != null) {
      console.log(validationResult.error);
      res.render('error', { message: 'Invalid user_id ' });
      return;
    }

    console.log("delete User Image: ");
    let responseData = await db_image.deleteImage({ picture_UUID: picture_UUID })
    if (!responseData) {
      res.render('error', { message: `Failed to delete the image` })
    }

    res.redirect(`/showPics`);
  }
  catch (ex) {
    res.render('error', { message: 'Error connecting to MySQL' });
    console.log("Error connecting to MySQL");
    console.log(ex);
  }
});


router.get('/showTextForUser', async (req, res) => {
  const isLoggedIn = isValidSession(req)
  if (isLoggedIn) {
    let user_ID = req.session.userID;
    let listOfTextResult = await db_text.getText({ user_ID: user_ID });
    res.render('textForm', { listOfText: listOfTextResult, isLoggedIn: isLoggedIn })
  } else {
    let listOfTextResultForPublic = await db_text.getTextForPublic();
    if (listOfTextResultForPublic) {
      res.render('showTextToPublic', { textContents: listOfTextResultForPublic, isLoggedIn: false })
    }
  }
})

router.post("/checkbox", sessionValidation, async (req, res, next) => {
  try {
    let user_id = req.session.userID;
    let uuid = req.body.uuid;
    let checkbox = req.body.check;

    console.log("checkbox hit");
    console.log("uuid", uuid)
    console.log("checked?", checkbox)

    const schema = Joi.object({
      user_id: Joi.number().integer().min(1).required(),
    });
    const validationResult = schema.validate({
      user_id: user_id,
    });
    if (validationResult.error != null) {
      console.log(validationResult.error);
      res.render("error", { message: "Invalid URL" });
      return;
    }

    let responseData = await db_url.active({ active: checkbox, uuid: uuid })
    if (!responseData) {
      res.render('error', { message: `Failed to create the URL ` })
    }

    res.redirect(`/links`);
  } catch (ex) {
    res.render("error", { message: "Error connecting to MySQL" });
    console.log("Error connecting to MySQL");
    console.log(ex);
  }
});


router.get("/sl", async (req, res) => {
  try {
    let user_id = req.session.userID;
    let uuid = req.query.id;
    console.log("user_id", user_id)
    console.log("uuid ", uuid)

    const schema = Joi.object({
      user_id: Joi.number().integer().min(1).required(),
    });
    const validationResult = schema.validate({
      user_id,
    });
    if (validationResult.error != null) {
      console.log(validationResult.error);
      res.render("error", { message: "Invalid value in links route" });
      return;
    }
    if (req.session.authenticated) {
      var isLoggedIn = true;
    } else {
      var isLoggedIn = false;
    }

    let responseData = await db_url.getURL({ uuid: uuid })
    if (!responseData || responseData[0][0].active !== 1) {
      res.render("linksNotActive", { isLoggedIn: isLoggedIn });
    } else {
      console.log(responseData);
      res.render("linksWait", { url: responseData[0][0].original_url, isLoggedIn: isLoggedIn });
    }
  } catch (ex) {
    res.render("error", { message: "Error connecting to MySQL" });
    console.log("Error connecting to MySQL");
    console.log(ex);
  }

});



router.get("/links", sessionValidation, async (req, res) => {
  try {
    let user_id = req.session.userID;
    console.log("user_id", user_id)

    const schema = Joi.object({
      user_id: Joi.number().integer().min(1).required(),
    });
    const validationResult = schema.validate({
      user_id,
    });
    if (validationResult.error != null) {
      console.log(validationResult.error);
      res.render("error", { message: "Invalid value in links route" });
      return;
    }
    let responseData = await db_url.getListOfURL({ user_id: user_id })
    if (!responseData) {
      res.render('error', { message: `Failed to retrieve the URL for:  ${req.body.pic_name}, `, title: "Loading URL failed" })
    }
    console.log(responseData[0])
    res.render("links", { url: responseData[0] });
  } catch (ex) {
    res.render("error", { message: "Error connecting to MySQL" });
    console.log("Error connecting to MySQL");
    console.log(ex);
  }

});


router.post("/addURL", sessionValidation, async (req, res, next) => {
  try {
    let user_id = req.session.userID;
    let url = req.body.url;
    console.log("add URL page hit");
    console.log("URL", url)
    console.log("user_id", user_id)

    const schema = Joi.object({
      user_id: Joi.number().integer().min(1).required(),
      url: Joi.string().uri().required()
    });
    const validationResult = schema.validate({
      user_id: user_id,
      url: url,
    });
    if (validationResult.error != null) {
      console.log(validationResult.error);
      res.render("error", { message: "Invalid URL" });
      return;
    }

    let responseData = await db_url.addURL({ url: url, user_id: user_id })
    if (!responseData) {
      res.render('error', { message: `Failed to create the URL for:  ${req.body.pic_name}, `, title: "Adding URL column failed" })
    }

    res.redirect(`/links`);
  } catch (ex) {
    res.render("error", { message: "Error connecting to MySQL" });
    console.log("Error connecting to MySQL");
    console.log(ex);
  }
});



router.get('/showText', sessionValidation, (req, res) => {
  res.render('textForm')
})

router.post('/submitText', async (req, res) => {
  let textTitle = req.body.text_title
  let user_ID = req.session.userID;
  let textContent = req.body.text_content
  let text_UUID = generateShortUUID.ShortUUID()
  let textSuccess = db_text.createText({ user_ID: user_ID, title: textTitle, content: textContent, textUUID: text_UUID })
  if (textSuccess) {
    res.redirect('/showTextForUser');
    return;
  } else if (!textSuccess) {
    res.render('error', { message: `Failed to create the text contents for:  ${textTitle}, `, title: "Text creation failed" })
  }
})

router.get('/:text_UUID', async (req, res) => {
  const isLoggedIn = isValidSession(req)
  let queryParamID = req.params.text_UUID;
  let selectedText;
  if (isLoggedIn) {
    let textContents = await db_text.getTextContent({ text_uuid: queryParamID });
    for (i = 0; i < textContents.length; i++) {
      if (textContents[i].text_UUID === queryParamID) {
        selectedText = textContents[i];
      }
    }
    console.log("Created Text??")
    res.render('viewOwnText', { textContents: selectedText, isLoggedIn: isLoggedIn })
  } else {
    let textContentsForPublic = await db_text.getTextForPublic({ text_uuid: queryParamID })
    for (i = 0; i < textContentsForPublic.length; i++) {
      if (textContentsForPublic[i].text_UUID === queryParamID) {
        selectedText = textContentsForPublic[i];
      }
    }
    res.render('createdTextForPublic', { textContents: selectedText, isLoggedIn: false })
  }
})

router.post('/editText', async (req, res) => {
  const isLoggedIn = isValidSession(req)
  let editedTextContent = req.body.new_text_content;
  let text_UUID = req.body.text_uuid;
  let textUpdateSuccess = await db_text.updateText({ editedTextContent: editedTextContent, textUUID: text_UUID })
  if (textUpdateSuccess) {
    let textContents = await db_text.getTextContent({ text_uuid: text_UUID });
    res.render('viewOwnText', { textContents: textContents, isLoggedIn: isLoggedIn })
  } else if (!textUpdateSuccess) {
    res.render('error', { message: `Failed to update the text contents for:  ${textTitle}, `, title: "Text update failed" })
  }
});



router.get('*', (req, res) => {
  res.status(404).render('error', { message: "404 No such page found." })
})

module.exports = router;
