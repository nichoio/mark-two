var Task = artifacts.require("Task");

module.exports = function(deployer) {
    deployer.deploy(
        Task,
        "0x12345d9cbe3a42899919fbd098d18f79bcf9a071",
        "What is 2+2?",
        "testkey",
        "42"
    );
};