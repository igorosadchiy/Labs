const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/add-city', (req, res) => {
    console.log(req.query)
    res.json(req.query)
});

app.post('/add-city', (req, res) => {
    console.log(req.body)
    res.json(req.body)
});

app.get('/:page_name', (req, res) => {
    res.sendFile(`${__dirname}/${req.param('page_name')}`);
});

app.listen(5000);
console.log('Server running');