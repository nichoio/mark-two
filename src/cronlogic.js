/*  logic for cron jobs. These functions check if relevant transactions
    on the blockchain are confirmed. After confirmation, db will be updated accordingly.
    The cron jobs themselves are set up withon server.js */

//check if transactions for creating contracts are confirmed
function observeTaskInit(db, eth) {
    db.getUnconfirmedTransactions()
    .then(function(rows){
        console.log("Count of unconfirmed task contracts: " + rows.length);
        if (!rows) {return;}

        for (let i = 0; i < rows.length; i++) {
            eth.getTaskByTransaction(rows[i].hash)
            .then(function(address){
                eth.getTaskData(address)
                .then(function(values){
                    var json = {
                        'contract': address,
                        'question': values[0],
                        'owner': values[1],
                        'corrector': values[2],
                        'keyword': values[3],
                        'maxScore': values[4]
                    };

                    return Promise.all([
                        db.updateTransaction(rows[i].hash), //remove from unconfirmed
                        db.addTask(json) //keep track of this contract in DB
                    ]);
                });
            })
            .catch(function(error) {
                if (error.message == 'Receipt is null') {
                    console.log(
                        'The following transaction is not confirmed yet: ' + rows[i].hash);
                }
                else{ console.log(error); }
            });
        }
    });
}

function observeBlankAnswers(db, eth) {
    db.getBlankAnswers()
    .then(function(rows){
        console.log("Count of blank answers: " + rows.length);
        if (!rows) {return;}

        for (let i = 0; i < rows.length; i++) {
            eth.getAnswer(rows[i].contract, rows[i].testee)
            .then(function(answer){
                if (answer) {
                    //replace placeholder with proper answer string
                    db.addAnswer(rows[i].contract, rows[i].testee, answer);
                }
                else{
                    console.log(
                        'The answer for the following contract + testee is not confirmed yet: ' +
                        rows[i].contract + ', ' + rows[i].testee);
                }
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    });
}

function observeUnconfirmedScores(db, eth) {
    db.getUnconfirmedScores()
    .then(function(rows){
        console.log("Count of unconfirmed scores: " + rows.length);
        if (!rows) {return;}

        for (let i = 0; i < rows.length; i++) {
            eth.getAnswerScore(rows[i].contract, rows[i].testee)
            .then(function(score){
                //TODO: detect if same score was given again (am besten im contract)
                if (score == rows[i].score || score == "0") { //if blockchain still returns old score (or null)
                    console.log(
                        'The score for the following contract + testee is not confirmed yet: ' +
                        rows[i].contract + ', ' + rows[i].testee);
                }
                else {
                    //replace current score (null or old one) with new score
                    //also confirm this score at the same time
                    db.updateScore(rows[i].contract, rows[i].testee, score);
                }
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    });
}

module.exports = {
    observeTaskInit: observeTaskInit,
    observeBlankAnswers: observeBlankAnswers,
    observeUnconfirmedScores: observeUnconfirmedScores
};