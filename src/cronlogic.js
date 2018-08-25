/*  logic for cron jobs. These functions check if relevant transactions
    on the blockchain are confirmed. After confirmation, db will be updated accordingly.
    The cron jobs themselves are set up within server.js */

/*
 * Checks if transactions for creating contracts are confirmed.
 * This function fetches data from the Ethereum network (no Ether needed).
 */
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
                        'maxScore': values[4],
                        'token': values[5],
                        'endDatetime': values[6]
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

/*
 * Checks if transactions for answering tasks are confirmed.
 * This function fetches data from the Ethereum network (no Ether needed).
 */
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
                    db.updateAnswer(rows[i].contract, rows[i].testee, answer);
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

/*
 * Checks if transactions for marking answers are confirmed.
 * This function fetches data from the Ethereum network (no Ether needed).
 */
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

/*
 * Checks if transactions for adding incentives to tasks are confirmed.
 * This function fetches data from the Ethereum network (no Ether needed).
 */
function observeRewards(db, eth) {
    db.getUnconfirmedRewards()
    .then(function(rows){
        console.log("Count of unconfirmed rewards: " + rows.length);
        if (!rows) {return;}

        for (let i = 0; i < rows.length; i++) {
            eth.getTaskTokenAmount(rows[i].contract)
            .then(function(amount){
                console.log("COMPARE REWARDS FOR:");
                console.log(rows[i].contract);
                console.log("DB AMOUNT:");
                console.log(rows[i].token_amount);
                console.log("BC AMOUNT:");
                console.log(Number(amount));
                //if blockchain still returns old amount
                if (Number(amount) == rows[i].token_amount) {
                    console.log(
                        'The reward for the following contract is not confirmed yet: ' +
                        rows[i].contract);
                }
                else {
                    db.updateReward(rows[i].contract, amount);
                }
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    });
}

/*
 * Checks if transactions for receiving rewards are confirmed.
 * This function fetches data from the Ethereum network (no Ether needed).
 */
function observePayouts(db, eth) {
    db.getUnconfirmedPayouts()
    .then(function(rows){
        console.log("Count of unconfirmed payouts: " + rows.length);
        if (!rows) {return;}

        for (let i = 0; i < rows.length; i++) {
            eth.getTaskTokenAmount(rows[i].contract)
            .then(function(amount){
                //if blockchain still returns old amount
                if (amount == rows[i].token_amount) {
                    console.log(
                        'The reward for the following contract is not confirmed yet: ' +
                        rows[i].contract);
                }
                else {
                    db.updateRewardPayout(rows[i].contract);
                }
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    });
}

/** Checks if any tasks have expired (e.g. Datetime of now > Datetime given for a task). */
function observeEndTime(db, eth) {
    db.finishExpiredTasks();
}

module.exports = {
    observeTaskInit: observeTaskInit,
    observeBlankAnswers: observeBlankAnswers,
    observeUnconfirmedScores: observeUnconfirmedScores,
    observePayouts: observePayouts,
    observeRewards: observeRewards,
    observeEndTime: observeEndTime
};