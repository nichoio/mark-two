const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');

const db = require('./db');
const eth = require('./ethereum');

const port = 3000 || process.env.PORT;
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/js/app.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'src', 'js', 'app.js'));
});

app.get('/js/jquery-3.3.1.min.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'src', 'js', 'jquery-3.3.1.min.js'));
});

app.get('/js/web3.min.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'src', 'js', 'web3.min.js'));
});

app.get('/css/bootstrap.min.css', function(req, res) {
  res.sendFile(path.join(__dirname, 'src', 'css', 'bootstrap.min.css'));
});

app.get('/TaskABI.json', function(req, res) {
  res.sendFile(path.join(__dirname, 'src', 'TaskABI.json'));
});

app.get('/Task.bin', function(req, res) {
  res.sendFile(path.join(__dirname, 'src', 'Task.bin'));
});

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/create', function(req, res){
  res.sendFile(path.join(__dirname, 'src', 'create.html'));
});

app.post('/create', function(req, res){
    eth.getTaskData(req.body.contract)
    .then(function(values){
        var json = {
            "contract": req.body.contract,
            "question": values[0],
            "owner": values[1],
            "corrector": values[2],
            "maxScore": values[3]
        };

        db.addTask(json); //keep track of this contract in DB
    });

    res.redirect('/tasks');
});

app.get('/tasks', function(req, res){
  res.sendFile(path.join(__dirname, 'src', 'tasks.html'));
});

app.listen(port, () => {
  console.log("Express Listening at http://localhost:" + port);
});
