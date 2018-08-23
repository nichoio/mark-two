var app = new Object();

app.web3Provider = null;
//for developing, the token address is hard coded
app.m2cAddress = "0xbb8f8A408e562a4FA5A058E73D9B6d3EAC0e0E33";
app.taskBinPath = "/eth/Task.bin";
app.taskABIPath = "/eth/TaskABI.json";
app.tokenABIPath = "/eth/EIP20ABI.json";

app.initWeb3 = function() {
  //Is there an injected web3 instance?
  if (typeof web3 !== 'undefined') {
    app.web3Provider = web3.currentProvider;
    console.log("Use injected/Metamask provider.");
  } else {
    //If no injected web3 instance is detected, fall back to Ganache
    app.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    console.log("Use new provider.");
  }
  web3 = new Web3(app.web3Provider);
};

//Deploy new task with current user as sender
app.newTask = function(question, corrector, keyword, maxScore, endTimestamp) {
  $.getJSON(app.taskABIPath, function(json) {
    $.get(app.taskBinPath, function(bin) {
      var task = new web3.eth.Contract(json);

      web3.eth.getAccounts(function(error, accounts) {
        web3.eth.getGasPrice()
        //looks like getGasPrice() returns price of mainnet regardless of actual provider
        .then(function(gasPrice){
          task.deploy({
            data: "0x" + bin, arguments: [
            corrector,
            question,
            keyword,
            maxScore,
            endTimestamp,
            app.m2cAddress
          ]})
          //price multiplied by 1.5 to make sure that transaction goes through
          //limit fixed since task contract always consume roughly 900k gas (regardless of chain)
          .send({from: accounts[0], gasPrice: gasPrice*1.5, gas: 2000000})
          .on('transactionHash', function(hash){
            app.postTask(hash, accounts[0]);
          });
        });
      });
    });
  });
};

//Solve an existing task with current user as sender
app.solveTask = function(address, answer) {
  $.getJSON(app.taskABIPath, function(json) {
    var task = new web3.eth.Contract(json, address);

    web3.eth.getAccounts(function(error, accounts) {
      web3.eth.getGasPrice()
      .then(function(gasPrice){
        task.methods.solve(answer).send(
            {from: accounts[0], gasPrice: gasPrice*1.5, gas: 2000000})
        .on('transactionHash', function(hash){
            //wait for transaction feedback/receipt
            app.setAnswer(address, accounts[0]);
        });
      });
    });
  });
};

app.postTask = function(transaction, owner) {
  console.log("Announce task to DAPP backend.");
  var path = '/create'; //POST to "create" route
  //What we're actually doing is telling the backend
  //the genesis transaction address of the new contract
  var form = $(
    '<form action="' + path + '" method="post">' +
    '<input type="hidden" name="transaction" value="' + transaction + '" />' +
    '<input type="hidden" name="owner" value="' + owner + '" />' +
    '</form>');
  $('body').append(form);
  form.submit();
};

app.setAnswer = function(contract, testee) {
  console.log("Announce backend that new answer was given.");
  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/create/answer', true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() {
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        location.reload(); //refresh page in order to show "Processing" button
      }
  };

  xhr.send("contract=" + contract + "&testee=" + testee);
};

app.account = function() {
  return new Promise(function (resolve, reject) {
    if(typeof web3 == "undefined") {
      resolve(); //return undefined
    }
    web3.eth.getAccounts(function(error, accounts) {
      resolve(accounts[0]);
    });
  });
};

app.mark = function(address, testee, score){
  $.getJSON(app.taskABIPath, function(json) {
    var task = new web3.eth.Contract(json, address);
    web3.eth.getAccounts(function(error, accounts) {
      web3.eth.getGasPrice()
      .then(function(gasPrice){
        task.methods.correct(testee, score).send(
            {from: accounts[0], gasPrice: gasPrice*1.5, gas: 2000000})
        .on('transactionHash', function(hash){
            //wait for transaction feedback
            app.updateScore(address, testee);
        });
      });
    });
  });  
};

app.updateScore = function(contract, testee) {
  console.log("Announce to backend that score was changed.");
  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/update/score', true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() { //Call a function when the state changes.
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
         location.reload(); //refresh page
      }
  };

  xhr.send("contract=" + contract + "&testee=" + testee);
};

// Transfer reward to task as current user
app.payTask = function(contract, tokenAmount) {
  $.getJSON(app.taskABIPath, function(taskAbi) {
    var task = new web3.eth.Contract(taskAbi, contract);
    task.methods.token().call() //TODO: get this data from db
    .then(function(tokenAddress){
      $.getJSON(app.tokenABIPath, function(eip20Abi) {
        var token = new web3.eth.Contract(eip20Abi, tokenAddress);
        web3.eth.getAccounts(function(error, accounts) {
          web3.eth.getGasPrice()
          .then(function(gasPrice){
            token.methods.transfer(contract, tokenAmount).send(
                {from: accounts[0], gasPrice: gasPrice*1.5, gas: 500000})
            .on('transactionHash', function(hash){
                app.postReward(contract);
            });
          });
        });
      }); 
    });
  });
};

app.postReward = function(contract) {
  console.log("Announce to backend that an incentive was added.");
  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/update/reward', true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() { //Call a function when the state changes.
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
         location.reload(); //refresh page
      }
  };

  xhr.send("contract=" + contract);
};

app.getBalance = function(address) {
  return new Promise(function (resolve, reject) {
    $.getJSON(app.tokenABIPath, function(eip20Abi) {
      var token = new web3.eth.Contract(eip20Abi, app.m2cAddress);
      token.methods.balanceOf(address).call()
      .then(function(balance){
        resolve(balance);
      });
    });
  });
};

app.getReward = function(contract) {
  $.getJSON(app.taskABIPath, function(taskAbi) {
    var task = new web3.eth.Contract(taskAbi, contract);
    web3.eth.getAccounts(function(error, accounts) {
      web3.eth.getGasPrice()
      .then(function(gasPrice){
        console.log("PREPARE TRANSACTION");
        task.methods.withdrawTokens().send(
            {from: accounts[0], gasPrice: gasPrice*1.5, gas: 500000})
        .on('transactionHash', function(hash){
            app.postPayout(contract);
        });
      });
    });
  });
};

app.postPayout = function(contract) {
  console.log("Announce to backend that an incentive was payed out.");
  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/update/reward', true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() { //Call a function when the state changes.
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
         location.reload(); //refresh page
      }
  };

  xhr.send("contract=" + contract);
};

$(window).on('load', function() {
  app.initWeb3();
});
