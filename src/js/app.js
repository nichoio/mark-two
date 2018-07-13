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

    return app.getTotalSupply();
  });

  return app.bindEvents();
};

app.getTotalSupply = function() {
  app.contracts.HelloWorld.deployed().then(function(instance) {
    return instance.totalSupply.call();
  }).then(function(totalSupply) {
     $('#totalSupply').text(String(totalSupply));
  }).catch(function(err) {
    console.log(err.message);
  });
};

$(function() {
  $(window).load(function() {
    app.init();
  });
});
