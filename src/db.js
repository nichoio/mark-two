const sqlite3 = require('sqlite3');

// var db = new sqlite3.Database('./mark_two_db.sqlt');

class DB{
    constructor(dbName) {
        this.db = new sqlite3.Database(dbName);
        //TODO: implement db.close()
    }

    addTask(json) {
        var con = json.contract;
        var que = json.question;
        var own = json.owner;
        var cor = json.corrector;
        var key = json.keyword;
        var max = json.maxScore;

        return new Promise(function (resolve, reject) {
            //check if Tasks table already has an entry under this contract address
            this.db.all("SELECT * FROM Tasks WHERE contract LIKE '" + con + "'", function(err, rows) {
                if (rows.length == 0){ //save this contract for the first time
                    this.db.run(
                        "INSERT INTO Tasks (contract, question, owner, corrector, keyword, maxscore)" +
                        "VALUES ('" + con + "', '" + que + "', '" + own + "', '" +
                        cor + "', '" + key + "', " + max + ");", function() {
                        console.log("Save new address to Tasks: " + con);
                        resolve();
                    });
                }
                else if (rows.length == 1) resolve();  // don't save since it's already there
                else { // should never happen hence let's exit
                    console.error(
                        "The following Task address is saved multiple times " + 
                        "(" + rows.length.toString() + " times) in table Tasks: " +
                        con);
                    process.exit(1); // terminate server
                }
            }.bind(this));
        }.bind(this));
    }

    getTasksByOwner(address) {
        return new Promise(function (resolve, reject) {
            this.db.all(
            "SELECT * FROM Tasks WHERE owner LIKE '" + address + "'", function(err, rows) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));
    }

    getTasksByKeyword(keyword) {
        //TODO: Add SQL-injection protection
        return new Promise(function (resolve, reject) {
            this.db.all(
            "SELECT * FROM Tasks WHERE LOWER(keyword) LIKE '" + keyword + "'", function(err, rows) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));
    }

    addTaskAnswer(contract, testee, answer) {
        return new Promise(function (resolve, reject) {
            this.db.all(
                "SELECT * FROM Testees WHERE contract LIKE '" + contract + "'" +
                "AND testee LIKE '" + testee + "'", function(err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this))
        .then(function(rows){
            //check if Testees table already has an answer saved for this task and this testee
            if (rows.length == 0){ //save this answer at the first time
                return this.db.run("INSERT INTO Testees (contract, testee, answer) " +
                    "VALUES ('" + contract + "', '" + testee + "', '" + answer + "');");
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
        }.bind(this));    
    }
}

module.exports = {
    DB: DB
};
