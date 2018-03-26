const TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");
const Lighthouse = artifacts.require("./PriceInUsdLighthouse.sol");

const findEventByNameOrFail = require('../testutil/txutil.js').findEventByNameOrFail;
const failOnFoundEvent = require('../testutil/txutil.js').failOnFoundEvent;

const expectedCatch = function() {
  assert.isOk(true);
};

const std_minPrice = 550;
const std_minBuyIn = web3.toWei(3, 'ether');
const std_penaltyPercentage = 450; // 45%
const std_blocksUntilMaturity = 35;

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];
  const lighthouseKeeper = accounts[1];
  const anyone = accounts[2];
  const coward1 = accounts[3];
  let coward1BeforeLeavingBalance;

  const hodler1 = accounts[4];
  let hodler1Maturity;

  const hodler2 = accounts[5];
  let hodler2Maturity;

  const inmature1 = accounts[6];
  let inmature1Maturity;

  it("leaving early should result in a penalty, but not leaving after", function() {
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
      assert.equal(false, evt.args._priceHasBeenReached);

      return contract.joinClub({from: hodler1, value: std_minBuyIn});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewHodler');
      hodler1Maturity = evt.args._maturityBlock;

      return contract.joinClub({from: coward1, value: std_minBuyIn});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'NewHodler');
      coward1BeforeLeavingBalance = web3.eth.getBalance(coward1);

      return contract.leaveClub({from: coward1});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'CowardLeftClub');

      assert.equal(coward1, evt.args._coward);
      assert.equal(web3.toWei(.15, 'ether'), evt.args._sentToAdminPool.valueOf());
      assert.equal(web3.toWei(1.35, 'ether'), evt.args._sentToHodlersPool.valueOf());
      assert.equal(web3.toWei(1.5, 'ether'), evt.args._withdrawn.valueOf());
    });
  });
});

