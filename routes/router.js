const router = require('express').Router();
//const mongoSanitize = require('express-mongo-sanitize');

//router.use(mongoSanitize(
//    {replaceWith: '%'}
//));

router.get('/', async (req, res) => {
    res.render('index');
});


module.exports = router;
