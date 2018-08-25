const sqlite3 = require('sqlite3');

/**
 * Represents a connection.
 * @constructor
 */
class DB{
    constructor(dbName) {
        this.db = new sqlite3.Database(dbName);
    }

    /**
     * Add a new transaction with it's hash address.
     * This is a write operation.
     */
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

    /**
     * Add a new task.
     * This is a write operation.
     */
    addTask(json) {
        var con = json.contract;
        var que = json.question;
        var own = json.owner;
        var cor = json.corrector;
        var key = json.keyword;
        var max = json.maxScore;
        var tok = json.token;
        var end = json.endDatetime;

        return new Promise(function (resolve, reject) {
            //check if Tasks table already has an entry under this contract address
            var stmt = this.db.prepare("SELECT * FROM Tasks WHERE contract LIKE ?");
            stmt.all([con], function(err, rows){
                if (rows.length == 0){ //save this contract for the first time
                    var stmt = this.db.prepare(
                        "INSERT INTO Tasks " +
                        "(contract, question, owner, corrector, " +
                        "keyword, maxscore, token_address, end_utc)" +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?);");
                    stmt.run([con, que, own, cor, key, max, tok, end], function(){
                        console.log("Save new address to Tasks: " + con);
                        resolve();
                    });
                }
                else if (rows.length == 1) resolve();  //don't save since it's already there
                else { //should never happen hence let's exit
                    console.error(
                        "The following Task address is saved multiple times " + 
                        "(" + rows.length.toString() + " times) in table Tasks: " +
                        con);
                    process.exit(1); //terminate server
                }
            }.bind(this));
        }.bind(this));
    }

    /**
     * Add a new empty answer pointing to an existing task.
     * This indicates that an answer was given but it's not confirmed yet.
     * This is a write operation.
     */
    addBlankAnswer(contract, testee) {
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
                    "INSERT INTO Answers (contract, testee) " +
                    "VALUES (?, ?);");
                stmt.run([contract, testee], function(){
                    console.log("Save new answer placeholder for Task: " + contract);
                });
            }
            else if (rows.length == 1) return; //don't save since it's already there
            else { //should never happen hence let's exit
                console.error(
                    "The following task plus testee combination is saved multiple times " + 
                    "(" + rows.length.toString() + " times) which is invalid in table Answers: " +
                    contract + ", " + testee);
                process.exit(1); //terminate server
            }
        }.bind(this));
    }

    /**
     * Set tasks to expired if appropiate (now > end datetime).
     * This is a write operation.
     */
    finishExpiredTasks(){
        return new Promise(function (resolve, reject) {
            this.db.run(
                "UPDATE Tasks " +
                "SET state = \"f\"" +
                "WHERE strftime(\"%s\",\"now\") > strftime(\"%s\", end_utc) " +
                "AND state LIKE\"o%\";", function(){
                console.log("Updating expired tasks.");
                resolve();
            });
        }.bind(this));
    }

    /**
     * Update new answer with a string representing the answer's text.
     * This is a write operation.
     */
    updateAnswer(contract, testee, answer) {
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
            if (rows.length == 1){ //override null placeholder with answer string
                var stmt = this.db.prepare(
                    "UPDATE Answers " +
                    "SET answer = ? " +
                    "WHERE contract LIKE ? AND testee LIKE ?;");
                stmt.run([answer, contract, testee], function(){
                    console.log("Save answer string for Task: " + contract);
                });
            }
            else if (rows.length > 1) { //should never happen hence let's exit
                console.error(
                    "The following task plus testee combination is saved multiple times " + 
                    "(" + rows.length.toString() + " times) which is invalid in table Answers: " +
                    contract + ", " + testee);
                process.exit(1); //terminate server
            }
        }.bind(this));
    }

    /**
     * Set a score as unconfirmed, thus a transaction updating this score is currently under way.
     * This is a write operation.
     */
    updateUnconfirmedScore(contract, testee) {
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
            if (rows.length == 1){ //set flag for unconfirmed score
                var stmt = this.db.prepare(
                    "UPDATE Answers " +
                    "SET score_confirmed = 0 " +
                    "WHERE contract LIKE ? AND testee LIKE ?;");
                stmt.run([contract, testee], function(){
                    console.log("Set score to unconfirmed for contract: " + contract);
                });
            }
            else if (rows.length > 1) { //should never happen hence let's exit
                console.error(
                    "The following task plus testee combination is saved multiple times " + 
                    "(" + rows.length.toString() + " times) which is invalid in table Answers: " +
                    contract + ", " + testee);
                process.exit(1); //terminate server
            }
        }.bind(this));
    }

    /**
     * Set a reward as unconfirmed, thus increase or decrease of funds is currently under way.
     * This is a write operation.
     */
    setUnconfirmedReward(contract) {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.prepare("SELECT * FROM Tasks WHERE contract LIKE ?");
            stmt.all([contract], function(err, rows){
                if (rows.length == 1){ //save this contract for the first time
                    var stmt = this.db.prepare(
                        "UPDATE Tasks " +
                        "SET token_confirmed = 0 " +
                        "WHERE contract LIKE ?;");
                    stmt.run([contract], function(){
                        console.log("Set reward to unconfirmed for contract: " + contract);
                        resolve();
                    });
                }
                else if (rows.length == 0) return;  //don't save since it's already there
                else { //should never happen hence let's exit
                    console.error(
                        "The following Task address is saved multiple times " + 
                        "(" + rows.length.toString() + " times) in table Tasks: " +
                        contract);
                    process.exit(1); //terminate server
                }
            }.bind(this));
        }.bind(this));
    }

    /**
     * Set a score as confirmed.
     * This is a write operation.
     */
    updateScore(contract, testee, score) {
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
            if (rows.length == 0) return;
            else if (rows.length == 1) {
                var stmt = this.db.prepare(
                    "UPDATE Answers " +
                    "SET score = ?, score_confirmed = 1 " + //also set confirmed to true!
                    "WHERE contract LIKE ? AND testee LIKE ?;");
                stmt.run([score, contract, testee], function(){
                    console.log("Update score for Task: " + contract);
                });                
            }
            else { //should never happen hence let's exit
                console.error(
                    "The following task plus testee combination is saved multiple times " + 
                    "(" + rows.length.toString() + " times) which is invalid in table Answers: " +
                    contract + ", " + testee);
                process.exit(1); //terminate server
            }
        }.bind(this));
    }

    /**
     * Set a reward as confirmed and add the exact amount of token being used.
     * This is a write operation.
     */
    updateReward(contract, amount) {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.prepare(
                "SELECT * FROM Tasks WHERE contract LIKE ?;");
            stmt.all([contract], function(err, rows){
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this))
        .then(function(rows){
            if (rows.length == 0) return;
            else if (rows.length == 1) {
                var stmt = this.db.prepare(
                    "UPDATE Tasks " +
                    "SET token_amount = ?, " +
                    "token_confirmed = 1, state = \"op\" " + //also change state!
                    "WHERE contract LIKE ?;");
                stmt.run([amount, contract], function(){
                    console.log("Update reward for Task: " + contract);
                });                
            }
            else { //should never happen hence let's exit
                    console.error(
                        "The following Task address is saved multiple times " + 
                        "(" + rows.length.toString() + " times) in table Tasks: " +
                        contract);
                process.exit(1); //terminate server
            }
        }.bind(this));
    }

    /**
     * Set a transaction as confirmed.
     * This is a write operation.
     */
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

    /**
     * Set a payout of a reward as confirmed.
     * This is a write operation.
     */
    updateRewardPayout(contract) {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.prepare(
                "SELECT * FROM Tasks WHERE contract LIKE ?;");
            stmt.all([contract], function(err, rows){
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this))
        .then(function(rows){
            if (rows.length == 0) return;
            else if (rows.length == 1) {
                var stmt = this.db.prepare(
                    "UPDATE Tasks " +
                    "SET token_confirmed = 1, state = \"fp\" " + //also change state!
                    "WHERE contract LIKE ?;");
                stmt.run([contract], function(){
                    console.log("Update reward payout for Task: " + contract);
                });                
            }
            else { //should never happen hence let's exit
                    console.error(
                        "The following Task address is saved multiple times " + 
                        "(" + rows.length.toString() + " times) in table Tasks: " +
                        contract);
                process.exit(1); //terminate server
            }
        }.bind(this));
    }

    /**
     * Get transactions which are marked as not confimed
     * This is a read-only operation.
     */
    getUnconfirmedTransactions() {
        return new Promise(function (resolve, reject) {
            var stmt = this.db.all(
                "SELECT * FROM TasksTransactions WHERE confirmed == 0;", function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));        
    }  

    /**
     * Get tasks with a certain owner.
     * This is a read-only operation.
     */
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

    /**
     * Get Tasks having a certain keyword.
     * This is a read-only operation.
     */
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

    /**
     * Get Tasks by keyword plus answered by a certain testee.
     * Join with Answers table and return the answer too.
     * This is a read-only operation.
     */
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

    /**
     * Get a single Task by address.
     * This is a read-only operation.
     */
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

    /**
     * Get answers with a blank answer e.g. not confirmed answer.
     * This is a read-only operation.
     */
    getBlankAnswers(){
        return new Promise(function (resolve, reject) {
            var stmt = this.db.all(
                "SELECT * FROM Answers WHERE answer IS NULL;", function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));
    }

    /**
     * Get answers which's scores are marked as not confimed.
     * This is a read-only operation.
     */
    getUnconfirmedScores(){
        return new Promise(function (resolve, reject) {
            var stmt = this.db.all(
                "SELECT * FROM Answers WHERE score_confirmed == 0;", function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));
    }

    /**
     * Get all answers to a certain Task.
     * This is a read-only operation.
     */
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

    /*
     * Get tasks which's rewards (balances on the token contract) are marked as not confimed.
     * This is a write operation.
     */
    getUnconfirmedRewards(){
        return new Promise(function (resolve, reject) {
            var stmt = this.db.all(
                "SELECT * FROM Tasks WHERE token_confirmed == 0 " +
                "AND state LIKE \"o\";", function(err, rows){
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    resolve(rows);
                }
            });
        }.bind(this));
    }

    /**
     * get tasks which's payouts of rewards (balances on the token contract)
     * are marked as not confimed.
     */
    getUnconfirmedPayouts(){
        return new Promise(function (resolve, reject) {
            var stmt = this.db.all(
                "SELECT * FROM Tasks WHERE token_confirmed == 0 " +
                "AND state LIKE \"f\";", function(err, rows){
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
