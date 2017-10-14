# Dsurance

We're using Truffle's pet shop demo as our starter code and iterating from there.
To depoloy:

```
testrpc
truffle compile
truffle migrate
```

Contract deployment code lives in `migrations/2_deploy_contracts.js`.

Front-end code can be as dumb as possible. I recommend just old HTML with Bootstrap to get things working.
Put all front-end code inside `src`. Avoid deleting any of the files in `src/js` since we'll by modifying plenty of
this to talk to out smart contracts the way we want to.

