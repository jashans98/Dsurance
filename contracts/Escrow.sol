pragma solidity ^0.4.4;

contract Escrow {

  struct Claim {
    address sender;
    uint amount;
    string textHash;
    string fileHash;
    uint numApprovals;
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
  
  mapping (address => uint) investorBalances;
  address[] investors;
  
  mapping (uint => Claim[]) claims;

  // fire events for front-end whenever something is done
  event LogRegistration(uint groupIndex, address sender);
  event LogDeregistration(uint groupIndex, address user);
  event LogPaidPremium(uint groupIndex, uint premium, address user);
  event LogWithdrawal(uint groupIndex, address receiver, uint amount);
  event LogCreation(uint groupIndex);
  event LogUpdate(uint groupIndex);


  event LogSubmitClaim(address user, uint groupIndex, string textHash, string fileHash);

  event LogRegisterInvestor(address investor, uint amount);
  event LogWithdrawInvestor(address investor, uint amount);
  event LogInvestorAddBalance(address investor, uint amount);
  event LogApprovedClaim(address investor, uint claimGroup, uint claimIndex);


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
    // verify the user
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

  function checkPaidUserForGroup(uint _groupIndex) constant returns (bool) {
    return groups[_groupIndex].paidUsers[msg.sender];
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


  // MARK: INVESTORS
  function registerAsInvestor() payable {
    require(msg.value >= 10 ether);
    investorBalances[msg.sender] = msg.value;
    investors.push(msg.sender);

    LogRegisterInvestor(msg.sender, msg.value);
  }

  function addBalanceAsInvestor() payable {
    // first check that the person calling the code is an investor
    bool isInvestor = false;
    for (uint i = 0; i < investors.length; i++) {
      if (investors[i] == msg.sender) {
        isInvestor = true;
      }
    }
    require(isInvestor);

    investorBalances[msg.sender] += msg.value;

    LogInvestorAddBalance(msg.sender, msg.value);
  }

  function withdrawAsInvestor(uint _amount) {
    require(_amount <= investorBalances[msg.sender]);

    msg.sender.transfer(_amount);
    LogWithdrawInvestor(msg.sender, _amount);
  }

  function getInvestorBalance() constant returns (uint) {
    return investorBalances[msg.sender];
  }

  function approveClaim(uint _groupIndex, uint _claimId) {
    // only investors with a certain stake in the network can approve claims; i.e. more than 10 ether

    // first check that the person calling the code is an investor
    bool isInvestor = false;
    for (uint i = 0; i < investors.length; i++) {
      if (investors[i] == msg.sender) {
        isInvestor = true;
      }
    }

    if (!isInvestor) revert();

    // now check the investor's stake
    require(investorBalances[msg.sender] >= 10 ether);

    // everything passes; approve the claim
    claims[_groupIndex][_claimId].numApprovals += 1;

    LogApprovedClaim(msg.sender, _groupIndex, _claimId);


    if (claims[_groupIndex][_claimId].numApprovals == 1) {
      // first approval: transfer balance
      claims[_groupIndex][_claimId].sender.transfer(claims[_groupIndex][_claimId].amount);
    }

  }





  // MARK: CLAIMS
  function submitClaim(uint _groupIndex, uint _requestedAmount, string _textHash, string _fileHash) {
    // TODO: check that the msg.sender is in fact a paying user in the group


    Claim memory c;
    c.sender = msg.sender;
    c.amount = _requestedAmount;
    c.textHash = _textHash;
    c.fileHash = _fileHash;

    claims[_groupIndex].push(c);

    LogSubmitClaim(msg.sender, _groupIndex, _textHash, _fileHash);
  }


  function numClaimsInGroup(uint _groupIndex) constant returns (uint) {
    return claims[_groupIndex].length;
  }

  function fetchClaimFromGroupByIndex(uint _groupIndex, uint _claimIndex) constant returns (address, uint, string, string) {
    Claim memory c = claims[_groupIndex][_claimIndex];
    return (c.sender, c.amount, c.textHash, c.fileHash);
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
