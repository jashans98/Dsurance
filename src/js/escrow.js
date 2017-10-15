EscrowApp = {
  web3Provider: null,
  contracts: {},
  escrowInstance: null, // make all smart contract calls/transactions via this object

  // set up web3 to interact with ethereum network
  init: function(cb) {
    console.log('initializing web3');
    if (typeof web3 !== 'undefined') {
      EscrowApp.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      EscrowApp.web3Provider = new web3.providers.HTTPProvider('http://localhost:8545');
      web3 = new Web3(EscrowApp.web3Provider);
    }

    return EscrowApp.initContract(cb);
  },

  // init contract
  initContract: function(cb) {
    $.getJSON('Escrow.json', function(data) {
      console.log('fetched artifact ' + data);
      var EscrowArtifact = data;

      EscrowApp.contracts.Escrow = TruffleContract(EscrowArtifact);
      // set the provider for our contract
      EscrowApp.contracts.Escrow.setProvider(EscrowApp.web3Provider);

      EscrowApp.contracts.Escrow.deployed().then(function(instance) {
        EscrowApp.escrowInstance = instance;
        if (cb) cb();
      });
    });

    web3.eth.getAccounts(function(err, accounts) {
      if (err) {
        console.log('error fetching accounts: ', err);
        return;
      }

      EscrowApp.account = accounts[0];
    })
  },

  // create group
  createGroup: function() {
    EscrowApp.escrowInstance.createInsuranceGroup({from: EscrowApp.account, value: web3.toWei(2, 'ether')}).then(function(result) {
      for (var i = 0; i < result.logs.length; ++i) {
        console.log(result.logs[i]);
      }
    });
  },

  countGroups: function(callback) {
    EscrowApp.escrowInstance.insuranceGroupCount.call().then(g => callback(g.toNumber()));
  },

  // force monthly updates so payments need to take place again
  forceUpdate: function() {
    
    EscrowApp.escrowInstance.forceUpdate({from: EscrowApp.account}).then(function(result) {
      for (var i = 0; i < result.logs.length; ++i) {
        console.log(result.logs[i]);
      }
    });
  },

  // register a user for an insurance group
  registerForInsuranceGroup: function(groupIndex) {
    EscrowApp.escrowInstance.registerForGroup(groupIndex, 
      {from: EscrowApp.account, value: web3.toWei(1, 'ether')}).then(function(result) {
      for (var i = 0; i < result.logs.length; ++i) {
        console.log(result.logs[i]);
      }
    });
  },

  deregisterFromGroup: function(groupIndex) {
    EscrowApp.escrowInstance.deregisterForGroup(groupIndex, 
      {from: EscrowApp.account}).then(function(result) {
        for (var i = 0; i < result.logs.length; ++i) {
          console.log(result.logs[i]);
        }
    });
  },

  // pass a function that accepts the amount, and then does something with it
  getMonthlyPaymentAmountForGroup: function(groupIndex, callback) {
    EscrowApp.escrowInstance.getMonthlyPremiumAmount.call(groupIndex).then(function(a) {
      callback(a.toNumber());
    });
  },

  payMonthlyPremiumForGroup: function(groupIndex) {
    EscrowApp.escrowInstance.getMonthlyPremiumAmount.call(groupIndex).then(function(a) {
      EscrowApp.escrowInstance.payPremium(0, {from: EscrowApp.account, value: web3.toWei(a, 'wei')}).then(function(result) {
        for (var i = 0; i < result.logs.length; ++i) {
          console.log(result.logs[i]);
        }
      })
    })
  },

  getContractBalance: function(cb) {
    EscrowApp.escrowInstance.getContractBalance.call().then(function(balance) {
      cb(balance.toNumber());
    });
  },

  getGroupBalance: function(groupIndex, cb) {
    EscrowApp.escrowInstance.totalBalanceForGroup.call(groupIndex).then(function(balance) {
      cb(balance.toNumber());
    });
  },

  withdrawAmountFromInsuranceGroup: function(groupIndex, amount) {
    EscrowApp.escrowInstance.withdraw(groupIndex, amount, {from: EscrowApp.account}).then(function(result) {
      for (var i = 0; i < result.logs.length; ++i) {
        console.log(result.logs[i]);
      }
    });
  },

  numUsersInGroup: function(groupIndex, callback) {
    EscrowApp.escrowInstance.numUsersInGroup.call(groupIndex).then(bigNum => callback(bigNum.toNumber()));
  },

  numPayingUsersInGroup: function(groupIndex, callback) {
    EscrowApp.escrowInstance.numPayingUsersInGroup.call(groupIndex).then(function(count) {
      callback(count.toNumber());
    });
  },


  userAddressInGroup: function(groupIndex, userIndex, callback) {
    EscrowApp.escrowInstance.userInGroup.call(groupIndex, userIndex).then(callback);
  },

  poolValueForGroup: function(groupIndex, callback) {
    EscrowApp.escrowInstance.totalBalanceForGroup.call(groupIndex).then(bigNum => callback(bigNum.toNumber()));
  },


  // Add claim functionality
  submitClaim: function(groupIndex, requestedAmount, textHash, fileHash) {
    EscrowApp.escrowInstance.submitClaim(groupIndex, requestedAmount, textHash, fileHash, {from: EscrowApp.account}).then(function(result) {
      for (var i = 0; i < result.logs.length; i++)
        console.log(result.logs[i]);
    });
  },

  numClaimsInGroup: function(groupIndex, callback) {
    EscrowApp.escrowInstance.numClaimsInGroup.call(groupIndex).then(function(numClaims) {
      callback(numClaims.toNumber());
    });
  },

  fetchClaimFromGroupByIndex: function(groupIndex, claimIndex, callback) {
    EscrowApp.escrowInstance.fetchClaimFromGroupByIndex.call(groupIndex, claimIndex).then(function(claimArray) {
      var claimObj = {
        sender: claimArray[0],
        amount: claimArray[1].toNumber(),
        textHash: claimArray[2],
        fileHash: claimArray[3]
      }
      callback(claimObj);
    });
  },

  // Add investor functionality
  // All of the functions below this are only for use in the investor portal
  registerAsInvestor: function(investment) {
    EscrowApp.escrowInstance.registerAsInvestor({from: EscrowApp.account, value: web3.toWei(investment, 'ether')}).then(function(result) {
      for (var i = 0; i < result.logs.length; i++)
        console.log(result.logs[i]);
    });
  },


  addBalanceAsInvestor: function(amount) {
    EscrowApp.escrowInstance.addBalanceAsInvestor({from: EscrowApp.account, value: web3.toWei(amount, 'ether')}).then(function(result) {
      for (var i = 0; i < result.logs.length; i++)
        console.log(result.logs[i]);
    });
  },

  getInvestorBalance: function(callback) {
    EscrowApp.escrowInstance.getInvestorBalance.call().then(function(balance) {
      callback(balance.toNumber());
    });
  },

  withdrawAsInvestor: function(amount) {
    // note that amount here is specified in Wei, multiply by 1e18 etc.
    EscrowApp.escrowInstance.withdrawAsInvestor(amount, {from: EscrowApp.account}).then(function(result) {
      for (var i = 0; i < result.logs.length; i++)
        console.log(result.logs[i]);
    });
  },

  approveClaimForGroupByIndex: function(groupIndex, claimIndex) {
    // only investors call this. Requires 100 ether for successful use
    EscrowApp.escrowInstance.approveClaim(groupIndex, claimIndex, {from: EscrowApp.account}).then(function(result) {
      for (var i = 0; i < result.logs.length; i++)
        console.log(result.logs[i]);
    })
  },

  // callback here gets called with a bool
  checkPaidUserForGroup: function(groupIndex, callback) {
    EscrowApp.escrowInstance.checkPaidUserForGroup.call(groupIndex).then(callback);
  }




}
