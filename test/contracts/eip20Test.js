var EIP20 = artifacts.require('EIP20');

contract('EIP20', accounts => {
    const [account1, account2, account3] = accounts;
    let eip20;

    beforeEach(async () => {
        eip20 = await EIP20.deployed();
    });

    it('transfer', async () => {
        await eip20.transfer(account2, 100, { from: account1});
        return eip20.balanceOf.call(account2)
        .then(function(balance) {
            assert.equal(balance, 100, 'It\'s not 100 M2C');
        });
    });

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
