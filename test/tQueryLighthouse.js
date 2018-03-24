var TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");
const Lighthouse = artifacts.require("./PriceInUsdLighthouse.sol");

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
          {from: founder, value: web3.toWei(std_minBuyIn, 'ether')});

    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'ClubInitialized');

      lighthouse.setPrice(75, {from: lighthouseKeeper});
    }).then(function() {
      return contract.queryLighthouse({from: anyone});
    }).then(function(tx) {
      const evt = findEventByNameOrThrow(tx, 'NewPriceFromLighthouse');

      assert.equal(anyone, evt.args._inquirer);
      assert.equal(75, evt.args._priceInUsdCents);
    });
  });
});
