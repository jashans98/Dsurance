EscrowApp = {
  web3Provider: null,
  contracts: {},
  escrowInstance: null, // make all smart contract calls/transactions via this object

  // set up web3 to interact with ethereum network
  init: function() {
    console.log('initializing web3');
    if (typeof web3 !== 'undefined') {
      EscrowApp.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      EscrowApp.web3Provider = new web3.providers.HTTPProvider('http://localhost:8545');
      web3 = new Web3(EscrowApp.web3Provider);
    }

    return EscrowApp.initContract();
  },

  // init contract
  initContract: function() {
    $.getJSON('Escrow.json', function(data) {
      console.log('fetched artifact ' + data);
      var EscrowArtifact = data;

      EscrowApp.contracts.Escrow = TruffleContract(EscrowArtifact);
      // set the provider for our contract
      EscrowApp.contracts.Escrow.setProvider(EscrowApp.web3Provider);

      EscrowApp.contracts.Escrow.deployed().then(function(instance) {
        EscrowApp.escrowInstance = instance;

      });
    });
  },

  fetchBalance: function() {
    web3.eth.getAccounts(function(err, accounts) {
      if (err) {
        console.log('error fetching accounts: ' + err);
        return;
      }

      var account = accounts[0];

      EscrowApp.escrowInstance.checkBalance.call(account).then(function(result) {
        console.log(result.toNumber());
      })
    })
  },

  putBalance: function(amount) {
    web3.eth.getAccounts(function(err, accounts) {
      if (err) {
        console.log('error fetching accounts: ' + err);
        return;
      }

      var account = accounts[0];

      EscrowApp.escrowInstance.deposit({from: account, value: web3.toWei(amount, 'ether')}).then(function (result) {
        for (var i = 0; i < result.logs.length; ++i) {
          var log = result.logs[i];
          console.log('Logged event: ', log);
        }
    })
    })
  }
}
