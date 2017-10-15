# Dsurance

Insurance concepts originate from early civilization, when farmers would group together to protect one another against famine, which could occur upon a poor harvest. At this time, if ever a family of farmers were to have a bad harvest, each of the farmers in the 'insurance network' would contribute a portion of the required relief to the farmers in need. With time, as the complexity of these networks have grown, centralized insurance institutions were born and have grown into those we know today.

The aim of Dsurance is to replace centralized insurance institutions with a smart contract on the blockchain, which would automatically pool premiums and guarantee payout of claims upon insured losses. This would remove the overhead cost of reserving, render the insurance process completely transparent, and allow virtually any type of insurance to be available to anybody across the globe. The smart contract would become the insurer.

Current features:

+Smart contract allows creation of arbitrary insurance networks that manage funds between policyholders and investors.
+Policyholder claim workflow and claim authorization process for investors to permit claim payouts.
+Mechanism to incentivize investors to authorize valid claims and reject fake claims.

Lots can be done to keep building on Dsurance. Most notably:

+Enhanced consensus algorithm between investors to establish validity of policyholder claims.
+Risk Segmentation algorithm allowing for policyholders to be charged as a function of their risk characteristics.
+Architecture to automatically create a smart contract for each new insurance network.
+Investment platform for the Pool Value to appreciate.
+Many security enhancements.

#How it Works

We're using Truffle's pet shop demo as our starter code and iterating from there.
To deploy:

```
testrpc
truffle compile
truffle migrate
```

Contract deployment code lives in `migrations/2_deploy_contracts.js`.

Front-end code can be as dumb as possible. I recommend just old HTML with Bootstrap to get things working.
Put all front-end code inside `src`. Avoid deleting any of the files in `src/js` since we'll by modifying plenty of
this to talk to out smart contracts the way we want to.


## Interacting with the Smart ContractI

`escrow.js` contains the interfact by which you will access the contract. Include it at the bottom of whatever
HTML file is serving the frontend code. Also make sure that you have `Escrow.json` (the smart contract ABI) 
in the **same** directory as your html files. `escrow.js` requires this to interact with Web3 properly and fetch
all our data. Notice how there's one giant `EscrowApp` object in `escrow.js`.

##### Notes on usage

Call `EscrowApp.init` whenever your page loads. This sets up Web3 and makes sure we're talking to the smart contract.
This needs to be called with a callback function, within which you should specify how to render the data etc.

Apart from `EscrowApp.init` and `EscrowApp.initContract`, every other function inside `EscrowApp` fetches relevant
data about claims and insurance groups. All of them take callbacks with one parameter. The names should be fairly
self-explanatory. Here's an example use-case


```javascript
EscrowApp.init(function() {
  EscrowApp.numUsersInGroup(0, numUsers => console.log('there are ' + numUsers + ' in group 0'));
})
```

Groups are identified by nonnegative integers between 0 and the total number of groups. An unfortunate consequence
of how Solidity is set up is that it limits what we can return from a smart contract. This means that if you want to
collect all the users address in all the groups you'd have to:

1. Query the number of groups
2. For each of those groups, find the number of users
3. Iterating over the number of users, you'd fetch the addresses one-by-one

This is annoying, but reading data off the chain is entirely free and cheap. For functions that write data to 
the chain (e.g. creating a new insurance group, registering a new user), MetaMark will prompt the user to sign
the transaction with a confirmation.
