const sqlite3 = require('sqlite3');

db = new sqlite3.Database('./mark_two_db.sqlt'); //TODO: implement db.close()

function addTask(json) {
    con = json.contract;
    que = json.question;
    own = json.owner;
    cor = json.corrector;
    max = json.maxScore;

    //check if task table already has an entry under this contract address
    db.all("SELECT * FROM Tasks WHERE contract LIKE '" + con + "'", function(err, rows) {
        if (rows.length == 0){ //save this contract for the first time
            db.run(
                "INSERT INTO Tasks (contract, question, owner, corrector, maxscore)" +
                "VALUES ('" + con + "', '" + que + "', '" + own + "', '" + cor + "', " + max + ");");
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

module.exports = {
    addTask: addTask,
};