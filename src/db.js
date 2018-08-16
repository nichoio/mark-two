const sqlite3 = require('sqlite3');

class DB{
    constructor(dbName) {
        this.db = new sqlite3.Database(dbName);
        //TODO: implement db.close()
    }

    addTransaction(hash) {
        return new Promise(function (resolve, reject) {
            //check if Transactions table already has an entry under this hash
            var stmt = this.db.prepare("SELECT * FROM TasksTransactions WHERE hash LIKE ?");
            stmt.all([hash], function(err, rows){
                if (rows.length == 0){
                    var stmt = this.db.prepare(
                        "INSERT INTO TasksTransactions (hash) VALUES (?);");
                    stmt.run([hash], function(){
                        console.log("Save new hash to TasksTransactions: " + hash);
                        resolve();
                    });
                }
                else if (rows.length == 1) resolve();  //don't save since it's already there
                else { //should never happen hence let's exit
                    console.error(
                        "The following TasksTransactions hash is saved multiple times " + 
                        "(" + rows.length.toString() + " times) in table TasksTransactions: " +
                        hash);
                    process.exit(1); //terminate server
                }
            }.bind(this));
        }.bind(this));        
    }

    getUnconfirmedTransactions() {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.all("SELECT * FROM TasksTransactions WHERE confirmed == 0;", function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));        
    }  


    //set confirmed attribute of transaction to True
    updateTransaction(hash) {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.prepare(
                "SELECT * FROM TasksTransactions WHERE hash LIKE ? AND confirmed == 0;");
            stmt.all([hash], function(err, rows){
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this))
        .then(function(rows){
            //don't save since if hash doesn't exist or is already confirmed
            if (rows.length == 0) return;
            else if (rows.length == 1) {
                var stmt = this.db.prepare(
                    "UPDATE TasksTransactions " +
                    "SET confirmed = 1 " +
                    "WHERE hash LIKE ?;");
                stmt.run([hash], function(){
                    console.log("Set confirmed True for Transaction: " + hash);
                });                
            }
            else { //should never happen hence let's exit
                console.error(
                    "The following TasksTransactions hash is saved multiple times " + 
                    "(" + rows.length.toString() + " times) in table TasksTransactions: " +
                    hash);
                process.exit(1); //terminate server
            }
        }.bind(this));    
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
            var stmt = this.db.prepare("SELECT * FROM Tasks WHERE contract LIKE ?");
            stmt.all([con], function(err, rows){
                if (rows.length == 0){ //save this contract for the first time
                    var stmt = this.db.prepare(
                        "INSERT INTO Tasks " +
                        "(contract, question, owner, corrector, keyword, maxscore)" +
                        "VALUES (?, ?, ?, ?, ?, ?);");
                    stmt.run([con, que, own, cor, key, max], function(){
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
            var stmt = this.db.prepare("SELECT * FROM Tasks WHERE owner LIKE ?");
            stmt.all([address], function(err, rows){
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
        return new Promise(function (resolve, reject) {
            //use "con" column as in getTasksByKeywordTestee()
            var stmt = this.db.prepare(
                "SELECT Tasks.contract AS con, * FROM Tasks WHERE LOWER(keyword) LIKE ?;");
            stmt.all([keyword], function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));
    }

    getTasksByKeywordTestee(keyword, testee) {
        return new Promise(function (resolve, reject) {
            //use "con" column because LEFT JOIN makes joined column null if join fails
            var stmt = this.db.prepare(
                "SELECT Tasks.contract AS con, * FROM Tasks " +
                "LEFT JOIN Answers ON Tasks.contract = Answers.contract " +
                "AND Answers.testee LIKE ? " +
                "WHERE LOWER(Tasks.keyword) LIKE ?;"
            );
            stmt.all([testee, keyword], function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));
    }    

    getTaskDetails(address) {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.prepare("SELECT * FROM Tasks WHERE contract LIKE ?;");
            stmt.all([address], function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows[0]);
                }
            });
        }.bind(this));        
    }    

    addAnswer(contract, testee, answer) {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.prepare(
                "SELECT * FROM Answers WHERE contract LIKE ? AND testee LIKE ?;");
            stmt.all([contract, testee], function(err, rows){
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this))
        .then(function(rows){
            //check if Answers table already has an answer saved for this task and this testee
            if (rows.length == 0){ //save this answer at the first time
                var stmt = this.db.prepare(
                    "INSERT INTO Answers (contract, testee, answer) " +
                    "VALUES (?, ?, ?);");
                stmt.run([contract, testee, answer], function(){
                    console.log("Save new answer for Task: " + contract);
                });
            }
            else if (rows.length == 1) return;  // don't save since it's already there
            else { // should never happen hence let's exit
                console.error(
                    "The following task plus testee combination is saved multiple times " + 
                    "(" + rows.length.toString() + " times) which is invalid in table Answers: " +
                    contract + ", " + testee);
                process.exit(1); // terminate server
            }
        }.bind(this));    
    }

    updateTaskScore(contract, testee, score) {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.prepare(
                "SELECT * FROM Answers WHERE contract LIKE ? AND testee LIKE ?;");
            stmt.all([contract, testee], function(err, rows){
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this))
        .then(function(rows){
            //check if Answers table already has an answer saved for this task and this testee
            if (rows.length == 0) return; //don't save since there was no answer given.
            else if (rows.length == 1) {
                var stmt = this.db.prepare(
                    "UPDATE Answers " +
                    "SET score = ? " +
                    "WHERE contract LIKE ? AND testee LIKE ?;");
                stmt.run([score, contract, testee], function(){
                    console.log("Update score for Task: " + contract);
                });                
            }
            else { // should never happen hence let's exit
                console.error(
                    "The following task plus testee combination is saved multiple times " + 
                    "(" + rows.length.toString() + " times) which is invalid in table Answers: " +
                    contract + ", " + testee);
                process.exit(1); // terminate server
            }
        }.bind(this));    
    }

    getAnswersByTask(address) {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.prepare("SELECT * FROM Answers WHERE contract LIKE ?");
            stmt.all([address], function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));    
    }
}

module.exports = {
    DB: DB
};
