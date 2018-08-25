//inspired by:
//https://github.com/MichalZalecki/tdd-solidity-intro/blob/master/test/FundingTest.js
var Task = artifacts.require('Task');

/**
 * Tests for Task contract.
 * Tests use the truffle test engine.
 */
contract('Task', accounts => {
    const [account1, account2, account3] = accounts;
    let task;

    beforeEach(async () => {
        task = await Task.deployed();
    });

    /** test reading the question string */
    it('call question', function() {
        return task.question.call()
        .then(function(question) {
            assert.equal(question, 'What is 2+2?', 'It\'s not "2+2"');
        });
    });

    /** test reading the keyword string */
    it('call keyword', function() {
        return task.keyword.call()
        .then(function(keyword) {
            assert.equal(keyword, 'testkey', 'It\'s not "testkey"');
        });
    });

    /** test adding a string to answer mapping */
    it("answer", async () => {
        await task.solve('myAnswer', { from: account1});
        return task.answers.call(account1)
        .then(function(answer) {
            assert.equal(answer, 'myAnswer', 'It\'s not "myAnswer"');
        });
    });

    //More tests for task correcting and more complex cases could be added here...
});
