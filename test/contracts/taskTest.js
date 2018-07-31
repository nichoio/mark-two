var Task = artifacts.require("Task");

//TODO: increase test coverage for Task

contract('Task', function() {
    it("Init task", function() {
        return Task.deployed().then(function(instance) {
            return instance.question.call();
        }).then(function(question) {
            assert.equal(question, "What is 2+2?", "It's not 2+2");
        });
    });
});
