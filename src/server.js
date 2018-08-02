const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const nunjucks = require('nunjucks');

const eth = require('./ethereum');
const dbModule = require('./db');

const port = 3000 || process.env.PORT;
const app = express();
const dbPath = './mark_two_db.sqlt';

var db = new dbModule.DB(dbPath);

nunjucks.configure(path.join(__dirname, 'views'), {
    express: app,
    watch: false,
    noCache: true
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/css', express.static(path.join(__dirname, 'css')))
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/eth', express.static(path.join(__dirname, 'eth')))

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
        res.redirect('/tasks/owner/' + values[1]); //show tasks of owner afterwards
    });
});

app.get('/tasks/owner/:owner', function(req, res){
    db.getTasksByOwner(req.params.owner)
    .then(function(values){
        for (let i = 0; i < values.length; i++) {
            // YYYY-MM-DD HH:MM:SS -> YYYY-MM-DD
            values[i].created_utc = values[i].created_utc.split(" ")[0];
        }

        var ownerShort = addressShort(req.params.owner);
        res.render('tasksowner.html', {tasks: values, ownerShort: ownerShort});
    });
});

app.get('/tasks/keyword/:keyword', function(req, res){
    db.getTasksByKeyword(req.params.keyword)
    .then(function(values){
        for (let i = 0; i < values.length; i++) {
            values[i].created_utc = values[i].created_utc.split(" ")[0];
        }

        res.render('taskskeyword.html', {tasks: values, keyword: req.params.keyword});
    });
});

app.get('/task/:address', function(req, res){
    p1 = db.getTaskDetails(req.params.address);
    p2 = db.getAnswersByTask(req.params.address);
    return Promise.all([p1, p2])
    .then(function(values) {
        if (values[0]) {  //if there is a task under this address
            var conShort = addressShort(values[0].contract);
            var ownShort = addressShort(values[0].owner);
            var corShort = addressShort(values[0].corrector);
            values[0].created_utc = values[0].created_utc.split(" ")[0];
            res.render(
                'task.html',
                {
                    task: values[0],
                    conShort: conShort,
                    ownShort: ownShort,
                    corShort: corShort,
                    answers: values[1]
                }
            );
        }
        else{
            res.status(404).send('Not found');
        }
    });
});

app.post('/update/answer', function(req, res){
    eth.getTaskAnswer(req.body.contract, req.body.testee)
    .then(function(answer){
        db.addTaskAnswer(req.body.contract, req.body.testee, answer)
        .then(function(){
            console.log("SENDE 200!");
            res.sendStatus(200);
        });
    });
});

app.post('/update/score', function(req, res){
    eth.getTaskScore(req.body.contract, req.body.testee)
    .then(function(score){
        console.log("DER SCORE IST:");
        console.log(score);
        db.addTaskScore(req.body.contract, req.body.testee, score)
        .then(function(){
            console.log("SENDE 200!");
            res.sendStatus(200);
        });
    });
});



app.listen(port, () => {
    console.log("Express Listening at http://localhost:" + port);
});

function addressShort(address) {
    return address.substring(0, 8) + '...';
}