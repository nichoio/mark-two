const moment = require('moment');
const Web3 = require('web3');

const taskAbi = require('./eth/TaskABI.json');
const eip20Abi = require('./eth/EIP20ABI.json');
const providers = require('./../secrets/providers.json');

/**
 * Represents a web2 session to a Ethereum network.
 * @constructor
 */
class Eth{
    constructor(provider) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(provider));
    }

    /*
     * Get address of a task by the transaction generating that address.
     * This function fetches data from the Ethereum network (no Ether needed).
     */
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

    /*
     * Get data about a certain task by it's address.
     * This function fetches data from the Ethereum network (no Ether needed).
     */
    getTaskData(address) {
        var task = new this.web3.eth.Contract(taskAbi, address);

        var p1 = task.methods.question().call();
        var p2 = task.methods.owner().call();
        var p3 = task.methods.corrector().call();
        var p4 = task.methods.keyword().call();
        var p5 = task.methods.maxScore().call();
        var p6 = task.methods.token().call();

        //convert UNIX timestampt to datetime (UTC always)
        var p7 = task.methods.endTimestamp().call()
        .then(function(value){
            return moment.utc(value*1000).format('YYYY-MM-DD kk:mm:ss');
        });

        return Promise.all([p1, p2, p3, p4, p5, p6, p7]);
    }

    /*
     * Get amount of token belonging to a certain task.
     * This function fetches data from the Ethereum network (no Ether needed).
     */
    getTaskTokenAmount(address) {
        return new Promise(function (resolve, reject) {
            var task = new this.web3.eth.Contract(taskAbi, address);
            task.methods.token().call()
            .then(function(tokenAddress){
                var token = new this.web3.eth.Contract(eip20Abi, tokenAddress);
                resolve(token.methods.balanceOf(address).call());
            }.bind(this));
        }.bind(this));
    }

    /*
     * Get an answer' string by task and testee.
     * This function fetches data from the Ethereum network (no Ether needed).
     */
    getAnswer(address, testee) {
        var task = new this.web3.eth.Contract(taskAbi, address);
        return task.methods.answers(testee).call();
    }

    /*
     * Get an answer' score by task and testee.
     * This function fetches data from the Ethereum network (no Ether needed).
     */
    getAnswerScore(address, testee) {
        var task = new this.web3.eth.Contract(taskAbi, address);
        return task.methods.scores(testee).call();
    }
}

module.exports = {
    Eth: Eth
};
