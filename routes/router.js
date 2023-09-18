const router = require('express').Router();
//const mongoSanitize = require('express-mongo-sanitize');

//router.use(mongoSanitize(
//    {replaceWith: '%'}
//));

router.get('/', async (req, res) => {
      res.send("<h1>Hello word <!h1>");
});


module.exports = router;
