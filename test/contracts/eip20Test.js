var EIP20 = artifacts.require('EIP20');

/**
 * Tests for M2C-ERC20 token.
 * Tests use the truffle test engine.
 */
contract('EIP20', accounts => {
    const [account1, account2, account3] = accounts;
    let eip20;

    beforeEach(async () => {
        eip20 = await EIP20.deployed();
    });

    /** test transferring tokens */
    it('transfer', async () => {
        await eip20.transfer(account2, 100, { from: account1});
        return eip20.balanceOf.call(account2)
        .then(function(balance) {
            assert.equal(balance, 100, 'It\'s not 100 M2C');
        });
    });

    /** test if transfer fails when sending zero tokens */
    it("Transfer zero", () => {
        return eip20.transfer(account2, 0, { from: account1})
        .then(() => {
            assert.ok(false, "Transaction successfull (unexpected)");
        }, () => {
            assert.ok(true);
        });
    });

    //More tests for transferring tokens and more complex cases could be added here...
});
