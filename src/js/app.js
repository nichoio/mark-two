var app = new Object();

app.web3Provider = null;
// app.contracts = {};

// app.init = function() {
//   return app.initWeb3();
// };

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

// app.initContract = function() {
//   $.getJSON('HelloWorld.json', function(data) {
//     // Get the necessary contract artifact file and instantiate it with truffle-contract
//     var HelloWorldArtifact = data;
//     app.contracts.HelloWorld = TruffleContract(HelloWorldArtifact);

//     // Set the provider for our contract
//     app.contracts.HelloWorld.setProvider(app.web3Provider);

//     return app.totalSupply();
//   });
// };

// app.totalSupply = function() {
//   app.contracts.HelloWorld.deployed().then(function(instance) {
//     return instance.totalSupply.call();
//   }).then(function(totalSupply) {
//      $('#totalSupply').text(String(totalSupply));
//   }).catch(function(err) {
//     console.log(err.message);
//   });
// };

// app.transfer = function(address, amount) {
//   console.debug(address);
//   app.contracts.HelloWorld.deployed().then(function(instance) {
//     return instance.transfer(address, amount);
//   }).then(function(success) {
//      $('#transactionSuccess').text(String(success));
//   }).catch(function(err) {
//     console.log(err.message);
//   });
// };

app.newTask = function(question, corrector, maxScore) {
  $.getJSON("TaskABI.json", function(json) {
    $.get("Task.bin", function(bin) {
      var task = new web3.eth.Contract(json);

      web3.eth.getAccounts(function(error, accounts) {
        task.deploy({
          data: "0x" + bin, arguments: [corrector, question, maxScore]}).send(
          {from: accounts[0], gasPrice: '1000', gas: 2000000}).on(
          'receipt', function(receipt){
            console.log("RECEIPT");
            console.log(receipt);
        });
      });
    });
  });
};

$(window).on('load', function() {
  app.initWeb3();
});
