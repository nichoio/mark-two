const path = require('path');

const bodyParser = require('body-parser');
const cron = require('cron');
const express = require('express');
const nunjucks = require('nunjucks');

const eth = require('./ethereum');
const dbModule = require('./db');
const cronl = require('./cronlogic');

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

app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/eth', express.static(path.join(__dirname, 'eth')));

app.get('/favicon.ico', function(req, res){
    res.sendFile(path.join(__dirname, 'img', 'favicon.ico'));
});

app.get('/', function(req, res){
    res.render('index.html');
});

app.get('/create', function(req, res){
    res.render('create.html');
});

app.post('/create', function(req, res){
    //save transaction to get picked up by cron job later
    db.addTransaction(req.body.transaction)
    .then(function(){
        //show tasks of owner afterwards (new contract might not be visible yet)
        res.redirect('/tasks/owner/' + req.body.owner);
    });
});

app.get('/tasks/owner/:owner', function(req, res){
    db.getTasksByOwner(req.params.owner)
    .then(function(values){
        values = utcsShorts(values);
        var ownerShort = addressShort(req.params.owner);
        res.render('tasksowner.html', {tasks: values, ownerShort: ownerShort});
    });
});

app.get('/tasks/keyword/:keyword', function(req, res){
    if (req.query.testee) {
        //look up tasks for this keyword plus answers and scores by given user
        db.getTasksByKeywordTestee(req.params.keyword, req.query.testee)
        .then(function(values){
            values = utcsShorts(values);
            res.render(
                'taskskeyword.html',
                {tasks: values, keyword: req.params.keyword, testee: req.query.testee});
        }); 
    }
    else{
        //just look up tasks for this keyword
        db.getTasksByKeyword(req.params.keyword)
        .then(function(values){
            values = utcsShorts(values);
            res.render('taskskeyword.html', {tasks: values, keyword: req.params.keyword});
        });
    }
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
            res.sendStatus(200);
        });
    });
});

app.post('/update/score', function(req, res){
    eth.getTaskScore(req.body.contract, req.body.testee)
    .then(function(score){
        db.updateTaskScore(req.body.contract, req.body.testee, score)
        .then(function(){
            res.sendStatus(200);
        });
    });
});

app.listen(port, () => {
    console.log("Express Listening at http://localhost:" + port);
});

new cron.CronJob('*/10 * * * * *', function() {
    cronl.observeTaskInit(db, eth);
  },
  null,
  true, //start job right now
  null
);

function addressShort(address) {
    return address.substring(0, 8) + '...';
}

function utcsShorts(values) {
    for (let i = 0; i < values.length; i++) {
        // YYYY-MM-DD HH:MM:SS -> YYYY-MM-DD
        values[i].created_utc = values[i].created_utc.split(" ")[0];
    }
    return values;
}