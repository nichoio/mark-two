const sqlite3 = require('sqlite3');

db = new sqlite3.Database('./mark_two_db.sqlt'); //TODO: implement db.close()

function addTask(json) {
    con = json.contract;
    que = json.question;
    own = json.owner;
    cor = json.corrector;
    key = json.keyword;
    max = json.maxScore;

    //check if Tasks table already has an entry under this contract address
    db.all("SELECT * FROM Tasks WHERE contract LIKE '" + con + "'", function(err, rows) {
        if (rows.length == 0){ //save this contract for the first time
            db.run(
                "INSERT INTO Tasks (contract, question, owner, corrector, keyword, maxscore)" +
                "VALUES ('" + con + "', '" + que + "', '" + own + "', '" +
                cor + "', '" + key + "', " + max + ");");
            console.log("Save new address to Tasks: " + con);
        }
        else if (rows.length == 1) return;  // don't save since it's already there
        else { // should never happen hence let's exit
            console.error(
                "The following Task address is saved multiple times " + 
                "(" + rows.length.toString() + " times) in table Tasks: " +
                con);
            process.exit(1); // terminate server
        }
    });
}

function getTasksByOwner(address) {
    return new Promise(function (resolve, reject) {
        db.all(
        "SELECT * FROM Tasks WHERE owner LIKE '" + address + "'", function(err, rows) {
            if (err) {
                console.error(err);
                process.exit(1);
            } else {
                resolve(rows);
            }
        });
    });
}

function getTasksByKeyword(keyword) {
    //TODO: Add SQL-injection protection
    return new Promise(function (resolve, reject) {
        db.all(
        "SELECT * FROM Tasks WHERE LOWER(keyword) LIKE '" + keyword + "'", function(err, rows) {
            if (err) {
                console.error(err);
                process.exit(1);
            } else {
                resolve(rows);
            }
        });
    });
}

function addTaskAnswer(contract, testee, answer) {
    return new Promise(function (resolve, reject) {
        db.all(
            "SELECT * FROM Testees WHERE contract LIKE '" + contract + "'" +
            "AND testee LIKE '" + testee + "'", function(err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
    .then(function(rows){
        //check if Testees table already has an answer saved for this task and this testee
        if (rows.length == 0){ //save this answer at the first time
            return db.run("INSERT INTO Testees (contract, testee, answer) " +
                "VALUES ('" + contract + "', '" + testee + "', '" + String(answer) + "');");
            console.log("Save new answer for Task: " + contract);
            //TODO: only show this after transaction is confirmed
        }
        else if (rows.length == 1) return;  // don't save since it's already there
        else { // should never happen hence let's exit
            console.error(
                "The following task plus testee combination is saved multiple times " + 
                "(" + rows.length.toString() + " times) which is invalid in table Testees: " +
                contract + ", " + testee);
            process.exit(1); // terminate server
        }
    });    
}

module.exports = {
    addTask: addTask,
    getTasksByOwner: getTasksByOwner,
    getTasksByKeyword: getTasksByKeyword,
    addTaskAnswer: addTaskAnswer,
};
