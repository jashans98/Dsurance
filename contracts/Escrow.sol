pragma solidity ^0.4.4;

contract Escrow {

  // store balances of each address
  mapping (address => uint) public balances;

  // fire events for front-end whenever something is done
  event LogDeposit(address sender, uint amount);
  event LogWithdrawal(address receiver, uint amount);
  event LogError(address, uint amount);

  function deposit() payable returns(bool) {
    balances[msg.sender] += msg.value;
    LogDeposit(msg.sender, msg.value);
    return true;
  }

  function withdraw(uint amount) public returns (bool) {
    require(balances[msg.sender] >= amount);
    if (msg.sender.send(amount)) {
      LogWithdrawal(msg.sender, amount);
      balances[msg.sender] -= amount;
      return true;
    } else {
      LogError(msg.sender, amount);
      return false;
    }
  }

  function checkBalance() public returns (uint) {
    return balances[msg.sender];
  }
}