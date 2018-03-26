const TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");
const Lighthouse = artifacts.require("./PriceInUsdLighthouse.sol");

const findEventByNameOrFail = require('../testutil/txutil.js').findEventByNameOrFail;
const failOnFoundEvent = require('../testutil/txutil.js').failOnFoundEvent;

const expectedCatch = function() {
  assert.isOk(true);
};

const std_minPrice = 550;
const std_minBuyIn = web3.toWei(3, 'ether');
const std_penaltyPercentage = 50;
const std_blocksUntilMaturity = 35;

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];

  it("should have the correct status", function () {
    let contract;
    let lighthouse;
    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;
      return Lighthouse.deployed();
    }).then(function (instance) {
      lighthouse = instance;

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: std_minBuyIn});

    }).then(function(tx) {
      const initEvt = findEventByNameOrFail(tx, 'ClubInitialized');
      assert.equal(founder, initEvt.args._founder);
      const newMemberEvt = findEventByNameOrFail(tx, 'NewHodler');
      assert.equal(founder, newMemberEvt.args._hodler);

      const expected = tx.receipt.blockNumber + std_blocksUntilMaturity;
      assert.equal(expected, newMemberEvt.args._maturityBlock.valueOf());

      return contract.getStatus.call({});
    }).then(function (result) {
      assert.equal(std_minPrice, result[0].valueOf());
      assert.equal(std_minBuyIn, result[1].valueOf());
      assert.equal(std_penaltyPercentage, result[2].valueOf());
      assert.equal(std_blocksUntilMaturity, result[3].valueOf());
      assert.equal(true, result[4].valueOf()); // founded
      assert.equal(false, result[5]); // price has been reached
      assert.equal(lighthouse.address, result[6].valueOf());
      assert.equal(0, result[7].valueOf()); // adminPool
      assert.equal(0, result[8].valueOf()); // hodlersPool
    });
  });
});

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];

  it("should NOT be able to be init if already init", function() {
    let contract;
    let lighthouse;
    return TheHodlersDotClub.deployed().then(function(instance) {
      contract = instance;

      return Lighthouse.deployed();
    }).then(function(instance) {
      lighthouse = instance;

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: std_minBuyIn});

    }).then(function(tx) {
      findEventByNameOrFail(tx, 'ClubInitialized');

      return contract.foundClub( std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity,
          {from: founder, value: std_minBuyIn})
          .then(assert.fail)
          .catch(expectedCatch);
    });
  });
});

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];
  const hodler1 = accounts[1];
  const hodler1BuyIn = std_minBuyIn;
  const hodler2 = accounts[2];

  const hodler2BuyIn = web3.toBigNumber(std_minBuyIn);
  const hodler2Extra = web3.toWei(0.5, 'ether');

  const hodler3 = accounts[3];
  const hodler3BuyIn = std_minBuyIn;

  let founderMaturity;
  let founderJoined;

  it("should be able to join club", function () {
    let contract;
    let lighthouse;
    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;

      return Lighthouse.deployed();
    }).then(function(instance) {
      lighthouse = instance;

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: std_minBuyIn});

    }).then(function(tx) {
      findEventByNameOrFail(tx, 'ClubInitialized');

      founderJoined = tx.receipt.blockNumber;
      founderMaturity = founderJoined + std_blocksUntilMaturity;
      return contract.joinClub({from: hodler1, value: hodler1BuyIn});
    }).then(function(tx) {
      var evt = findEventByNameOrFail(tx, 'NewHodler');
      assert.equal(hodler1, evt.args._hodler);
      assert.equal(hodler1BuyIn, evt.args._hodling);
      const expected = tx.receipt.blockNumber + std_blocksUntilMaturity;
      assert.equal(expected, evt.args._maturityBlock);

      return contract.joinClub({from: hodler2, value: hodler2BuyIn});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewHodler');
      assert.equal(hodler2, evt.args._hodler);
      assert.equal(hodler2BuyIn.valueOf(), evt.args._hodling.valueOf());
      const expected = tx.receipt.blockNumber + std_blocksUntilMaturity;
      assert.equal(expected, evt.args._maturityBlock);

      return contract.joinClub({from: hodler2, value: hodler2Extra});
    }).then(function(tx) {
      failOnFoundEvent(tx, 'NewHodler');
      const evt = findEventByNameOrFail(tx, 'HolderLevelIncreased');
      assert.equal(hodler2, evt.args._hodler);
      assert.equal(hodler2Extra, evt.args._increase.valueOf());
      const expected = web3.toBigNumber(hodler2Extra).add(hodler2BuyIn);
      assert.equal(expected.valueOf(), evt.args._hodling.valueOf());

      return contract.getHodlers.call({});
    }).then(function(result) {
      assert.include(result, founder);
      assert.include(result, hodler1);
      assert.include(result, hodler2);
      return contract.getHodlerInfo.call(hodler2);
    }).then(function(result) {
      const expected = web3.toBigNumber(hodler2Extra).add(hodler2BuyIn);
      assert.equal(expected.valueOf(), result[2].valueOf());

      return contract.getHodlerInfo.call(founder);
    }).then(function(result) {
      assert.equal(founderJoined, result[0].valueOf());
      assert.equal(founderMaturity, result[1].valueOf());
      assert.equal(std_minBuyIn, result[2].valueOf());
    });
  });

  it("should not be able to the join club if sent below min value", function () {
    let contract;

    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;

      return contract.getStatus.call({});
    }).then(function (result) {
      assert.equal(std_minPrice, result[0].valueOf());
      assert.equal(std_minBuyIn, result[1].valueOf());
      assert.equal(std_penaltyPercentage, result[2].valueOf());
      assert.equal(std_blocksUntilMaturity, result[3].valueOf());
    }).then(function () {
      return contract.joinClub({from: hodler3, value: hodler3BuyIn})
          .then(assert.fail)
          .catch(expectedCatch);
    });
  });

});


contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];
  const hodler1 = accounts[1];
  const hodler1BuyIn = std_minBuyIn;

  let founderMaturity;
  let founderJoined;
  const roundOff = 88;

  it("should round off last 100000 wei", function () {
    let contract;
    let lighthouse;
    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;

      return Lighthouse.deployed();
    }).then(function (instance) {
      lighthouse = instance;

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: web3.toBigNumber(std_minBuyIn).add(roundOff)});

    }).then(function (tx) {
      findEventByNameOrFail(tx, 'ClubInitialized');

      let evtNewHodler = findEventByNameOrFail(tx, 'NewHodler');
      assert.equal(web3.toBigNumber(std_minBuyIn).valueOf(), evtNewHodler.args._hodling.valueOf());

      founderJoined = tx.receipt.blockNumber;
      founderMaturity = founderJoined + std_blocksUntilMaturity;
      return contract.joinClub({from: hodler1, value: web3.toBigNumber(hodler1BuyIn).add(roundOff)});
    }).then(function (tx) {
      var evt = findEventByNameOrFail(tx, 'NewHodler');
      assert.equal(hodler1, evt.args._hodler);
      assert.equal(hodler1BuyIn, evt.args._hodling);
      const expected = tx.receipt.blockNumber + std_blocksUntilMaturity;
      assert.equal(expected, evt.args._maturityBlock);

      return contract.getStatus.call({});
    }).then(function(result) {
      assert.equal(roundOff * 2, result[7].valueOf()); // adminPool
      assert.equal(0, result[8].valueOf()); // hodlersPool

      return contract.joinClub({from: hodler1, value: web3.toWei(100000, 'wei')});
    }).then(function() {
      return contract.joinClub({from: hodler1, value: web3.toWei(roundOff, 'wei')})
          .then(assert.fail)
          .catch(expectedCatch);
    });
  });
});
