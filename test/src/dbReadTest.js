const spawn = require('child_process').spawn;

const assert = require('chai').assert;
const sqlite3 = require('sqlite3');

const dbTestPath = './test/src/test_db.sqlt';
const dbModule = require('./../../src/db');

var db = new dbModule.DB(dbTestPath);

describe('dbRead', function(){
    var dbTest;

    before(function() {
        return new Promise(function (resolve) {
            const sqlite3CMD = spawn('sqlite3', [dbTestPath]);

            sqlite3CMD.stdout.on('data', (data) => {
              console.log(`stdout: ${data}`);
            });

            sqlite3CMD.stderr.on('data', (data) => {
              console.log(`stderr: ${data}`);
            });

            dbTest = new sqlite3.Database(dbTestPath);
            dbTest.serialize(function() {
                dbTest.run(
                    "CREATE TABLE Tasks " + 
                    "(contract TEXT NOT NULL, owner TEXT NOT NULL, question TEXT NOT NULL, " +
                    "corrector TEXT NOT NULL, keyword TEXT NOT NULL, maxscore INTEGER NOT NULL, " +
                    "created_utc TEXT DEFAULT CURRENT_TIMESTAMP);");
                dbTest.run(
                    "CREATE TABLE Testees (contract TEXT NOT NULL, testee TEXT NOT NULL, " +
                    "answer TEXT NOT NULL, score INTEGER);");
                dbTest.run(
                    "INSERT INTO Tasks (contract, question, owner, corrector, keyword, maxscore)" +
                    "VALUES ('0x992340b63317E301a7B3828Cee73dE7af08c6543', " +
                    "'What is 2+2?', '0xd0b98B0a7cCa6c5F7099E79DdD79Cfee0f4c3121', " +
                    "'0x8aFb13d3978352Dc26617dB9b114B796D3371050', 'testkeyword', 10);" + 
                    "INSERT INTO Tasks (contract, question, owner, corrector, keyword, maxscore)");
                dbTest.run(
                    "INSERT INTO Tasks (contract, question, owner, corrector, keyword, maxscore)" +
                    "VALUES ('0xcf39DFd741a02634dBCD5067b5F60272E39418E7', " +
                    "'What is transparent and smells like worms?', " + 
                    "'0xd0b98B0a7cCa6c5F7099E79DdD79Cfee0f4c3121', " +
                    "'0xE51D0Aed7B6125f66c735238C6c7063B7e4A2dCf', 'testkeyword', 8);");
                dbTest.run("INSERT INTO Testees (contract, testee, answer) " +
                    "VALUES ('0x992340b63317E301a7B3828Cee73dE7af08c6543', " +
                    "'0xfFc8c5b844E2a0DB895D6E29Fd757Df0285AEEF6', 'myAnswer');");
                dbTest.run("INSERT INTO Testees (contract, testee, answer) " +
                    "VALUES ('0x992340b63317E301a7B3828Cee73dE7af08c6543', " +
                    "0x20F9384e132cB839FE970fBA7a0601D0C21fa9fE, 'myDifferentAnswer');", function(){
                    resolve(); //must go here, otherwise won't work
                });
            });
        });
    });

    it('getTasksByOwner', function(done) {
        db.getTasksByOwner('0xd0b98B0a7cCa6c5F7099E79DdD79Cfee0f4c3121')
        .then(function(values){
            assert.equal(values.length, 2, 'It\'s not 2');
            done();
        });
    });

    it('getTasksByKeyword', function(done) {
        db.getTasksByKeyword('testkeyword')
        .then(function(values){
            assert.equal(values.length, 2, 'It\'s not 2"');
            done();
        });
    });

    after(function() {
        dbTest.close();
        const rm = spawn('rm', [dbTestPath]);

        rm.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });

        rm.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`);
        });
    });
});
