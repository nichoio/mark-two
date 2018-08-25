var Task = artifacts.require('Task');
const assert = require('chai').assert;
const ether = require('./../../src/ethereum');
const providers = require('./../../secrets/providers.json');

var eth = new ether.Eth(providers.local);

/**
 * Tests for ethereum interface.
 * Tests use the truffle test engine.
 * But instead of just testing the contract
 * the logic built around the contracts is being tested here
 */
contract('Task', function() {
    let task;

    beforeEach(async () => {
        task = await Task.deployed();
    });

    it('check getData()', async() => {
        data = await eth.getTaskData(task.address);
        assert.equal(data[0], 'What is 2+2?', 'It\'s not "2+2"');
        //skip data[1] (owner) since it's predetermined independently from test suite
        assert.equal(
            data[2].toLowerCase(),
            '0x12345d9cbe3a42899919fbd098d18f79bcf9a071',
            'Wrong corrector');
        assert.equal(data[3], 'testkey', 'It\'s not "testkey"');
        assert.equal(data[4], 42, 'It\'s not 42');
    });

    //More tests for the missing functions of ethereum.js could be added here
});
