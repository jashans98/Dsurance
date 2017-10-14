EscrowApp = {
  web3Provider: null,
  contracts: {},
  escrowInstance, // make all smart contract calls/transactions via this object

  // set up web3 to interact with ethereum network
  init: function() {
    console.log('initializing web3');
    if (typeof web3 !== 'undefined') {
      EscrowApp.web3Provider = web3.currentProvider;
      web3 = newWeb3(web3.currentProvider);
    } else {
      EscrowApp.web3Provider = new web3.providers.HTTPProvider('http://localhost:8545');
      web3 = new Web3(EscrowApp.web3Provider);
    }

    return EscrowApp.initContract();
  },

  // init contract
  initContract: function() {
    $.getJSON('Escrow.json', function(data) {
      console.log('fetched artifact');
      var EscrowArtifact = data;

      EscrowApp.contracts.Escrow = TruffleContract(EscrowArtifact);
      // set the provider for our contract
      EscrowApp.contracts.Escrow.setProvider(EscrowApp.web3Provider);

      EscrowApp.contracts.Escrow.deployed().then(function(instance) {
        EscrowApp.escrowInstance = instance;

        return EscrowApp.escrowInstance.checkBalance.call();
      }).then(function(balance) {
        console.log('user balance: ' + balance)
      })
    });
  }
}
