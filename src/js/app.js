var app = new Object();

app.web3Provider = null;

app.initWeb3 = function() {
  // Is there an injected web3 instance?
  if (typeof web3 !== 'undefined') {
    app.web3Provider = web3.currentProvider;
    console.log("Use Metamask provider.");
  } else {
    // If no injected web3 instance is detected, fall back to Ganache
    app.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    console.log("Use new provider.");
  }
  web3 = new Web3(app.web3Provider);
};

//Deploy new task with current Metamask user as sender
app.newTask = function(question, corrector, keyword, maxScore) {
  $.getJSON("/eth/TaskABI.json", function(json) {
    $.get("/eth/Task.bin", function(bin) {
      var task = new web3.eth.Contract(json);

      web3.eth.getAccounts(function(error, accounts) {
        task.deploy({
          data: "0x" + bin, arguments: [corrector, question, keyword, maxScore]}).send(
          {from: accounts[0], gasPrice: '1000', gas: 2000000}).on(
          'receipt', function(receipt){
            app.postTask(receipt.contractAddress);
        });
      });
    });
  });
};

//Solve an existing task with current Metamask user as sender
app.solveTask = function(address, answer) {
  $.getJSON("/eth/TaskABI.json", function(json) {
    var answerBytes = web3.utils.utf8ToHex(answer);
    var task = new web3.eth.Contract(json, address);

    web3.eth.getAccounts(function(error, accounts) {
      task.methods.solve(answerBytes).send(
          {from: accounts[0], gasPrice: '1000', gas: 2000000}).on(
        'receipt', function(receipt){
          //wait for transaction feedback/receipt
          app.setAnswer(address, accounts[0]);
      });
    });
  });
};

app.postTask = function(contract) {
  console.log("Post task to DAPP backend.");
  var path = '/create';  //POST to "create" route
  var form = $(
    '<form action="' + path + '" method="post">' +
    '<input type="hidden" name="contract" value="' + contract + '" />' +
    '</form>');
  $('body').append(form);
  form.submit();
};

app.setAnswer = function(contract, testee) {
  console.log("order DAPP backend to set answer.");
  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/update/answer', true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() { //Call a function when the state changes.
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        location.reload(); // refresh page
      }
  };

  xhr.send("contract=" + contract + "&testee=" + testee);
};

app.account = function() {
  return new Promise(function (resolve, reject) {
    if(typeof web3 == "undefined") {
      resolve();  //return undefined
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
          {from: accounts[0], gasPrice: '1000', gas: 2000000}).on(
        'receipt', function(receipt){
          //wait for transaction feedback/receipt
          app.updateScore(address, testee);
      });
    });
  });  
};

app.updateScore = function(contract, testee) {
  console.log("order DAPP backend to update score.");
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
