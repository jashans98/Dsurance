pragma solidity ^0.4.4;

contract Escrow {

  struct Claim {
    address sender;
    string textHash;
    string pictureHash;
    uint approved;
  }

  struct InsuranceGroup {
    mapping (address => bool) registeredUsers;
    mapping (address => bool) paidUsers;
    address[] users;    uint lastUpdatedTime;
    uint requiredMonthlyPayment;
    uint totalAmountWithdrawn;
    uint groupBalance;
  }




  InsuranceGroup[] groups;
  address[] investors;
  Claim[] claims;

  // fire events for front-end whenever something is done
  event LogRegistration(uint groupIndex, address sender);
  event LogDeregistration(uint groupIndex, address user);
  event LogPaidPremium(uint groupIndex, uint premium, address user);
  event LogWithdrawal(uint groupIndex, address receiver, uint amount);
  event LogCreation(uint groupIndex);
  event LogUpdate(uint groupIndex);
  event LogAcceptClaim(address investor, uint claimIndex);


  function registerForGroup(uint groupIndex) payable {
    // require a 1 ether deposit for this to work properly
    require(msg.value == 1 ether);

    groups[groupIndex].users.push(msg.sender);

    groups[groupIndex].registeredUsers[msg.sender] = true;

    groups[groupIndex].paidUsers[msg.sender] = false; // don't let them withdraw until premium has been paid

    groups[groupIndex].groupBalance += msg.value;

    LogRegistration(groupIndex, msg.sender);

    updateMonthly(groupIndex);
  }


  function deregisterForGroup(uint groupIndex) {
    // make sure the user is actually registered to the group; don't transfer to anyone
    require(groups[groupIndex].registeredUsers[msg.sender]);

    // remove the user from mappings
    delete(groups[groupIndex].registeredUsers[msg.sender]);
    delete(groups[groupIndex].paidUsers[msg.sender]);

    // return their deposit back
    groups[groupIndex].groupBalance -= 1 ether;
    msg.sender.transfer(1 ether);

    LogDeregistration(groupIndex, msg.sender);
  }


  function payPremium(uint groupIndex) payable {
    // require the premium to be exactly equal to the monthy premium for the group
    require(groups[groupIndex].requiredMonthlyPayment <= msg.value);

    // make sure the user isn't paying the premium twice
    require(groups[groupIndex].paidUsers[msg.sender] == false);

    // set payment to true
    groups[groupIndex].paidUsers[msg.sender] = true;

    groups[groupIndex].groupBalance += msg.value;

    LogPaidPremium(groupIndex, groups[groupIndex].requiredMonthlyPayment, msg.sender);

    updateMonthly(groupIndex);
  }

  function getGroupBalance(uint groupIndex) constant returns (uint) {
    return groups[groupIndex].groupBalance;
  }

  function getContractBalance() constant returns (uint) {
    return this.balance;
  }

  function getMonthlyPremiumAmount(uint groupIndex) constant returns (uint) {
    return groups[groupIndex].requiredMonthlyPayment;
  }

  function withdraw(uint groupIndex, uint amount) {
    verify the user
    require(groups[groupIndex].registeredUsers[msg.sender]);
    require(groups[groupIndex].paidUsers[msg.sender]);
    require(amount < groups[groupIndex].groupBalance);
    msg.sender.transfer(amount);

    groups[groupIndex].groupBalance -= amount;


    LogWithdrawal(groupIndex, msg.sender, amount);
  }


  function updateMonthly(uint groupIndex) internal {
    if (now - 30 days >= groups[groupIndex].lastUpdatedTime) {
      groups[groupIndex].lastUpdatedTime = now;

      // reset paidUsers mapping to false
      for (uint i = 0; i < groups[groupIndex].users.length; i++) {
        groups[groupIndex].paidUsers[groups[groupIndex].users[i]] = false;
      }

      groups[groupIndex].requiredMonthlyPayment = (groups[groupIndex].totalAmountWithdrawn * 101153145236) / 10000000000;
      groups[groupIndex].totalAmountWithdrawn = 0; // reset amount withdrawn for the month
    }
  }

  function totalBalanceForGroup(uint groupIndex) constant returns (uint) {
    return groups[groupIndex].groupBalance;
  }


  // for testing only
  function forceUpdate(uint groupIndex) {
    groups[groupIndex].lastUpdatedTime = now;

    // reset paidUsers mapping to false
    for (uint i = 0; i < groups[groupIndex].users.length; i++) {
      groups[groupIndex].paidUsers[groups[groupIndex].users[i]] = false;
    }

    groups[groupIndex].requiredMonthlyPayment = (groups[groupIndex].totalAmountWithdrawn * 101153145236) / 10000000000;
    groups[groupIndex].totalAmountWithdrawn = 0; // reset amount withdrawn for the month

    LogUpdate(groupIndex);
  }

  function insuranceGroupCount() constant returns (uint) {
    return groups.length;
  }


  function createInsuranceGroup() payable {
    require(msg.value >= 2 ether);
    InsuranceGroup memory group;
    group.lastUpdatedTime = now;
    group.groupBalance = 2 ether;
    
    groups.push(group);

    LogCreation(groups.length);
  }

  function numUsersInGroup(uint groupIndex) constant returns (uint) {
    return groups[groupIndex].users.length;
  }

  function userInGroup(uint groupIndex, uint userIndex) constant returns (address) {
    return groups[groupIndex].users[userIndex];
  }



  // MARK: CLAIMS

  function submitClaim(string _textHash, string _pictureHash) {

    Claim memory c;
    c.sender = msg.sender;
    c.textHash = _textHash;
    c.pictureHash = _pictureHash;
    c.approved = 0;

    claims.push(c);
  }

  function numClaims() constant returns (uint) {
    return claims.length;
  }

  function fetchClaim(uint _claimId) constant returns (address, string, string, uint) {
    Claim memory c = claims[_claimId];

    return (c.sender, c.textHash, c.pictureHash, c.approved);
  }

  function acceptClaim(uint claimIndex) {
    bool fromSender = false;
    for (uint i = 0; i < investors.length; ++i) {
      if (investors[i] == msg.sender) {
        fromSender = true;
      }
    }

    require(fromSender);

    claims[claimIndex].approved += 1;

    LogAcceptClaim(msg.sender, claimIndex);
  }




  // DEBUG functions
  function numPayingUsersInGroup(uint groupIndex) constant returns (uint) {
    uint result = 0;
    for (uint i = 0; i < groups[groupIndex].users.length; i++) {
      if (groups[groupIndex].paidUsers[groups[groupIndex].users[i]]) {
        result += 1;
      }
    }

    return result;
  }


}
