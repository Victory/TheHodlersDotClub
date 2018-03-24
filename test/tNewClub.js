var TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");

const findEventByNameOrThrow = require('../testutil/txutil.js').findEventByNameOrThrow;
const failOnFoundEvent = require('../testutil/txutil.js').failOnFoundEvent;

const expectedCatch = function() {
  assert.isOk(true);
};

const std_minPrice = 550;
const std_minBuyIn = 3;
const std_penaltyPercentage = 50;
const std_blocksUntilMaturity = 35;

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];

  it("should be able to be init", function () {
    let contract;
    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity,
          {from: founder, value: web3.toWei(std_minBuyIn, 'ether')});

    }).then(function (tx) {
      const initEvt = findEventByNameOrThrow(tx, 'ClubInitialized');
      assert.equal(founder, initEvt.args._founder);
      const newMemberEvt = findEventByNameOrThrow(tx, 'NewMember');
      assert.equal(founder, newMemberEvt.args._member);

      const expected = tx.receipt.blockNumber + std_blocksUntilMaturity;
      assert.equal(expected, newMemberEvt.args._maturityBlock.valueOf());

      return contract.getStatus.call({});
    }).then(function (result) {
      assert.equal(std_minPrice, result[0].valueOf());
      assert.equal(std_minBuyIn, result[1].valueOf());
      assert.equal(std_penaltyPercentage, result[2].valueOf());
      assert.equal(std_blocksUntilMaturity, result[3].valueOf());
    });
  });
});

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];

  it("should NOT be able to be init if already init", function() {
    let contract;
    return TheHodlersDotClub.deployed().then(function(instance) {
      contract = instance;

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity,
          {from: founder, value: web3.toWei(std_minBuyIn, 'ether')});

    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'ClubInitialized');

      return contract.foundClub( std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity,
          {from: founder, value: web3.toWei(std_minBuyIn, 'ether')})
          .then(assert.fail)
          .catch(expectedCatch);
    });
  });
});

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];
  const member1 = accounts[1];
  const member1BuyIn = web3.toWei(std_minBuyIn, 'ether');
  const member2 = accounts[2];

  const member2BuyIn = web3.toWei(std_minBuyIn + 1, 'ether');
  const member2Extra = web3.toWei(0.5, 'ether');

  const member3 = accounts[3];
  const member3BuyIn = web3.toWei(std_minBuyIn, 'ether');

  it("should be able to join club", function () {
    var contract;
    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity,
          {from: founder, value: web3.toWei(std_minBuyIn, 'ether')});

    }).then(function (tx) {
      findEventByNameOrThrow(tx, 'ClubInitialized');

      return contract.joinClub({from: member1, value: member1BuyIn});
    }).then(function (tx) {
      var evt = findEventByNameOrThrow(tx, 'NewMember');
      assert.equal(member1, evt.args._member);
      assert.equal(member1BuyIn, evt.args._hodling);
      const expected = tx.receipt.blockNumber + std_blocksUntilMaturity;
      assert.equal(expected, evt.args._maturityBlock);

      return contract.joinClub({from: member2, value: member2BuyIn});
    }).then(function (tx) {
      const evt = findEventByNameOrThrow(tx, 'NewMember');
      assert.equal(member2, evt.args._member);
      assert.equal(member2BuyIn, evt.args._hodling);
      const expected = tx.receipt.blockNumber + std_blocksUntilMaturity;
      assert.equal(expected, evt.args._maturityBlock);

      return contract.joinClub({from: member2, value: member2Extra});
    }).then(function (tx) {
      failOnFoundEvent(tx, 'NewMember');
      const evt = findEventByNameOrThrow(tx, 'HolderLevelIncreased');
      assert.equal(member2, evt.args._member);
      assert.equal(member2Extra, evt.args._increase.valueOf());
      const expected = web3.toBigNumber(member2Extra).add(member2BuyIn);
      assert.equal(expected.valueOf(), evt.args._hodling.valueOf());
    });
  });

  it("should not be able to the join club if send below min value", function () {
    var contract;
    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;

      return contract.getStatus.call({});
    }).then(function (result) {
      assert.equal(std_minPrice, result[0].valueOf());
      assert.equal(std_minBuyIn, result[1].valueOf());
      assert.equal(std_penaltyPercentage, result[2].valueOf());
      assert.equal(std_blocksUntilMaturity, result[3].valueOf());
    }).then(function () {
      return contract.joinClub({from: member3, value: member3BuyIn})
          .then(assert.fail)
          .catch(expectedCatch);
    });
  });

});
