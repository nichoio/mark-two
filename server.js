const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');
// const Web3 = require('web3');

const port = 3000 || process.env.PORT;
// const truffle_connect = require('./src/js/app')

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
  res.sendFile(path.join(__dirname, 'src', 'create2.html'));
});

app.get('/mytasks', function(req, res){
  res.sendFile(path.join(__dirname, 'src', 'mytasks.html'));
});

app.listen(port, () => {
  console.log("Express Listening at http://localhost:" + port);
});
