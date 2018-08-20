const Web3 = require('web3');

const taskAbi = require('./eth/TaskABI.json');
const providers = require('./../secrets/providers.json');

class Eth{
    constructor(provider) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(provider));
    }

    getTaskByTransaction(hash) {
        return new Promise(function (resolve, reject) {
            this.web3.eth.getTransactionReceipt(hash)
            .then(function(data){
                if (data) {
                    //return destination of transaction, i.e. the task contract
                    resolve(data.contractAddress);
                }
                else{
                    reject(new TypeError('Receipt is null'));
                }
            });
        }.bind(this)); 
    }

    getTaskData(address) {
        var task = new this.web3.eth.Contract(taskAbi, address);

        var p1 = task.methods.question().call();
        var p2 = task.methods.owner().call();
        var p3 = task.methods.corrector().call();
        var p4 = task.methods.keyword().call();
        var p5 = task.methods.maxScore().call();

        return Promise.all([p1, p2, p3, p4, p5]);
    }

    getAnswer(address, testee) {
        var task = new this.web3.eth.Contract(taskAbi, address);
        return task.methods.answers(testee).call();
    }

    getAnswerScore(address, testee) {
        var task = new this.web3.eth.Contract(taskAbi, address);
        return task.methods.scores(testee).call();
    }
}

module.exports = {
    Eth: Eth
};
