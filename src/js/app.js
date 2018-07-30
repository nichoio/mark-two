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

//deploy new task with current Metamask user as sender
app.newTask = function(question, corrector, keyword, maxScore) {
  $.getJSON("TaskABI.json", function(json) {
    $.get("Task.bin", function(bin) {
      var task = new web3.eth.Contract(json);

      web3.eth.getAccounts(function(error, accounts) {
        task.deploy({
          data: "0x" + bin, arguments: [corrector, question, keyword, maxScore]}).send(
          {from: accounts[0], gasPrice: '1000', gas: 2000000}).on(
          'receipt', function(receipt){
            app.postTask(receipt.contractAddress);
        });  //TODO: refactor
      });
    });
  });
};

app.postTask = function(contract) {
  console.log("POST!!");
  var path = 'create';  //POST to "create" route
  var form = $(
    '<form action="' + path + '" method="post">' +
    '<input type="text" name="contract" value="' + contract + '" />' +
    '</form>');
  $('body').append(form);
  form.submit();
};

$(window).on('load', function() {
  app.initWeb3();
});
