var app = new Object();

app.web3Provider = null;

app.initWeb3 = function() {
  // Is there an injected web3 instance?
  if (typeof web3 !== 'undefined') {
    app.web3Provider = web3.currentProvider;
    console.log("Use injected/Metamask provider.");
  } else {
    // If no injected web3 instance is detected, fall back to Ganache
    app.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    console.log("Use new provider.");
  }
  web3 = new Web3(app.web3Provider);
};

//Deploy new task with current user as sender
app.newTask = function(question, corrector, keyword, maxScore) {
  $.getJSON("/eth/TaskABI.json", function(json) {
    $.get("/eth/Task.bin", function(bin) {
      var task = new web3.eth.Contract(json);

      web3.eth.getAccounts(function(error, accounts) {
        task.deploy({
          data: "0x" + bin, arguments: [corrector, question, keyword, maxScore]})
        .send({from: accounts[0], gasPrice: '1000', gas: 2000000})
        .on('transactionHash', function(hash){
          app.postTask(hash, accounts[0]);
        });
      });
    });
  });
};

//Solve an existing task with current user as sender
app.solveTask = function(address, answer) {
  $.getJSON("/eth/TaskABI.json", function(json) {
    var task = new web3.eth.Contract(json, address);

    web3.eth.getAccounts(function(error, accounts) {
      task.methods.solve(answer).send(
          {from: accounts[0], gasPrice: '1000', gas: 2000000})
      .on('transactionHash', function(hash){
          //wait for transaction feedback/receipt
          app.setAnswer(address, accounts[0]);
      });
    });
  });
};

app.postTask = function(transaction, owner) {
  console.log("Announce task to DAPP backend.");
  var path = '/create';  //POST to "create" route
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
  $.getJSON("/eth/TaskABI.json", function(json) {
    var task = new web3.eth.Contract(json, address);

    web3.eth.getAccounts(function(error, accounts) {
      task.methods.correct(testee, score).send(
          {from: accounts[0], gasPrice: '1000', gas: 2000000})
      .on('transactionHash', function(hash){
          //wait for transaction feedback/receipt
          app.updateScore(address, testee);
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
         location.reload(); // refresh page
      }
  };

  xhr.send("contract=" + contract + "&testee=" + testee);
};

$(window).on('load', function() {
  app.initWeb3();
});
