var app = new Object();

app.web3Provider = null;
app.contracts = {};

app.init = function() {
  return app.initWeb3();
};

app.initWeb3 = function() {
  // Is there an injected web3 instance?
  if (typeof web3 !== 'undefined') {
    app.web3Provider = web3.currentProvider;
  } else {
    // If no injected web3 instance is detected, fall back to Ganache
    app.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
  }
  web3 = new Web3(app.web3Provider);

  return app.initContract();
};

app.initContract = function() {
  $.getJSON('HelloWorld.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var HelloWorldArtifact = data;
    app.contracts.HelloWorld = TruffleContract(HelloWorldArtifact);

    // Set the provider for our contract
    app.contracts.HelloWorld.setProvider(app.web3Provider);

    return app.totalSupply();
  });
};

app.totalSupply = function() {
  app.contracts.HelloWorld.deployed().then(function(instance) {
    return instance.totalSupply.call();
  }).then(function(totalSupply) {
     $('#totalSupply').text(String(totalSupply));
  }).catch(function(err) {
    console.log(err.message);
  });
};

app.transfer = function(address, amount) {
  console.debug(address);
  app.contracts.HelloWorld.deployed().then(function(instance) {
    return instance.transfer(address, amount);
  }).then(function(success) {
     $('#transactionSuccess').text(String(success));
  }).catch(function(err) {
    console.log(err.message);
  });
};

$(function() {
  $(window).load(function() {
    app.init();
  });

  $('#transferForm').submit(function(e) {
      console.log('do something');
      e.preventDefault(); // don't submit form
      var address = $('#transferForm').find('input[id="transferAddress"]').val();
      var amount = $('#transferForm').find('input[id="transferAmount"]').val();
      amount = Number(amount);
      console.log(address);
      app.transfer(address, amount);
  });
});
