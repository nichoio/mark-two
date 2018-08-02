const Web3 = require('web3');

const taskAbi = require('./eth/TaskABI.json');

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

function getTaskData(address) {
    var task = new web3.eth.Contract(taskAbi, address);

    var p1 = task.methods.question().call();
    var p2 = task.methods.owner().call();
    var p3 = task.methods.corrector().call();
    var p4 = task.methods.keyword().call();
    var p5 = task.methods.maxScore().call();

    return Promise.all([p1, p2, p3, p4, p5]);
}

function getTaskAnswer(address, testee) {
    var task = new web3.eth.Contract(taskAbi, address);

    return task.methods.answers(testee).call()
    .then(function(res){
        return web3.utils.hexToUtf8(res); //resolve bytes back to ASCII
    });
}

function getTaskScore(address, testee) {
    var task = new web3.eth.Contract(taskAbi, address);
    return task.methods.scores(testee).call();
}

module.exports = {
    getTaskData: getTaskData,
    getTaskAnswer: getTaskAnswer,
    getTaskScore: getTaskScore,
};
