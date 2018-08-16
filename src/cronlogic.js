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

function observeTaskAnswers(db, eth) {

}

module.exports = {
    observeTaskInit: observeTaskInit,
    observeTaskAnswers: observeTaskAnswers
};