const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const nunjucks = require('nunjucks');

const db = require('./db');
const eth = require('./ethereum');

const port = 3000 || process.env.PORT;
const app = express();

nunjucks.configure(path.join(__dirname, 'src', 'views'), {
    express: app,
    watch: false,
    noCache: true
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/img', express.static(path.join(__dirname, 'src', 'img')))
app.use('/css', express.static(path.join(__dirname, 'src', 'css')))
app.use('/js', express.static(path.join(__dirname, 'src', 'js')))

app.get('/TaskABI.json', function(req, res) {
    res.sendFile(path.join(__dirname, 'src', 'TaskABI.json'));
});

app.get('/Task.bin', function(req, res) {
    res.sendFile(path.join(__dirname, 'src', 'Task.bin'));
});

app.get('/', function(req, res){
    res.render('index.html');
});

app.get('/create', function(req, res){
    res.render('create.html');
});

app.post('/create', function(req, res){
    eth.getTaskData(req.body.contract)
    .then(function(values){
        var json = {
            "contract": req.body.contract,
            "question": values[0],
            "owner": values[1],
            "corrector": values[2],
            "keyword": values[3],
            "maxScore": values[4]
        };

        db.addTask(json); //keep track of this contract in DB
        res.redirect('/tasks/' + values[1]); //show tasks of owner afterwards
    });
});

app.get('/tasks/:owner', function(req, res){
    db.getTasksByOwner(req.params.owner)
    .then(function(values){
        for (let i = 0; i < values.length; i++) {
            // YYYY-MM-DD HH:MM:SS -> YYYY-MM-DD
            values[i].created_utc = values[i].created_utc.split(" ")[0];
        }
        var ownerShort = req.params.owner.substring(0, 8) + '...'; 
        res.render('tasks.html', {tasks: values, ownerShort: ownerShort});
    });
});

app.listen(port, () => {
    console.log("Express Listening at http://localhost:" + port);
});
