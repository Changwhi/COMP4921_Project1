const express = require ('express');

const port = process.env.PORT || 3000;

const app = express();

app.get('/', (req, res) => {
    res.send("<h1>Hello word <!h1>");
});

app.listen(port, () => {
    console.log("Node app listening on Port"+port)
});
