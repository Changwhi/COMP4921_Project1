require('dotenv').config();

const express = require('express');

const port = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + "/public"));

const router = include('routes/router');
app.use('/',router);

app.listen(port, () => {
	console.log("Node application listening on port: "+ port);
}); 

//Define the include global function for absolute file name, removing the use of parent directories. when using include() vs require to help with module imports.
global.base_dir = __dirname;
global.abs_path = function(path) {
	return base_dir + path;
}
global.include = function(file) {
	return require(abs_path('/' + file));
}