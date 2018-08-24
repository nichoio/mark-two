const moment = require('moment');

var EIP20 = artifacts.require('EIP20');
var Task = artifacts.require('Task');

//pick arbitraty moment in future
var now1hlater = (moment.utc().valueOf() / 1000) + 3600;

module.exports = function(deployer) {
    deployer.deploy(EIP20)
    .then(function() {
	    return deployer.deploy(
	        Task,
	        '0x12345d9cbe3a42899919fbd098d18f79bcf9a071',
	        'What is 2+2?',
	        'testkey',
	        '42',
	        now1hlater,
	        EIP20.address
	    );
    });
};