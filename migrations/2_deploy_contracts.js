var Escrow = artifacts.require("./Escrow.sol");

module.exports = function(deployer) {
  deployer.deploy(Escrow);
}
