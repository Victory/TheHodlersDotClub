const TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");
const Lighthouse = artifacts.require("./PriceInUsdLighthouse.sol");

const findEventByNameOrFail = require('../testutil/txutil.js').findEventByNameOrFail;

const std_minPrice = 550;
const std_minBuyIn = web3.toWei(3, 'ether');
const std_penaltyPercentage = 50;
const std_blocksUntilMaturity = 35;

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];
  const lighthouseKeeper = accounts[1];
  const anyone = accounts[2];

  it("should be able to query the lighthouse", function() {
    let contract;
    let lighthouse;
    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;
      return Lighthouse.deployed();
    }).then(function (instance) {
      lighthouse = instance;

      return lighthouse.addKeeper(lighthouseKeeper, {from: founder});
    }).then(function() {

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: std_minBuyIn});

    }).then(function(tx) {
      findEventByNameOrFail(tx, 'ClubInitialized');

      lighthouse.setPrice(75, {from: lighthouseKeeper});
    }).then(function() {
      return contract.queryLighthouse({from: anyone});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewPriceFromLighthouse');
      assert.equal(anyone, evt.args._inquirer);
      assert.equal(75, evt.args._priceInUsdCents);
      assert.equal(false, evt.args._priceHasBeenReached);

      return lighthouse.setPrice(std_minPrice + 1, {from: lighthouseKeeper});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'PriceUpdated');
      assert.equal(std_minPrice + 1, evt.args._priceInUsdCents);

      return contract.queryLighthouse({from: anyone});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewPriceFromLighthouse');
      assert.equal(anyone, evt.args._inquirer);
      assert.equal(std_minPrice + 1, evt.args._priceInUsdCents);
      assert.equal(true, evt.args._priceHasBeenReached);

      return lighthouse.setPrice(std_minPrice -1, {from: lighthouseKeeper});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'PriceUpdated');
      assert.equal(std_minPrice - 1, evt.args._priceInUsdCents);

      return contract.queryLighthouse({from: anyone});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewPriceFromLighthouse');
      assert.equal(anyone, evt.args._inquirer);
      assert.equal(std_minPrice - 1, evt.args._priceInUsdCents);
      assert.equal(true, evt.args._priceHasBeenReached);
    });
  });
});
