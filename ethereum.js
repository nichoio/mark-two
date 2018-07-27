const Web3 = require('web3');

const taskAbi = require('./src/TaskABI.json');

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

function getTaskData(address) {
    var task = new web3.eth.Contract(taskAbi, address);

    var p1 = task.methods.question().call();
    var p2 = task.methods.owner().call();
    var p3 = task.methods.corrector().call();
    var p4 = task.methods.maxScore().call();

    return Promise.all([p1, p2, p3, p4]);
}

module.exports = {
    getTaskData: getTaskData,
};