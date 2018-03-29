const TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");
const Lighthouse = artifacts.require("./PriceInUsdLighthouse.sol");

const blockMiner = require('../testutil/blockminer');
const ClubStatus = require('../testutil/clubstatus').ClubStatus;
const HodlerInfo = require('../testutil/clubstatus').HodlerInfo;

const findEventByNameOrFail = require('../testutil/txutil.js').findEventByNameOrFail;
const failOnFoundEvent = require('../testutil/txutil.js').failOnFoundEvent;

const expectedCatch = function() {
  assert.isOk(true);
};

const std_minPrice = 550;
const std_minBuyIn = web3.toWei(3, 'ether');
const std_penaltyPercentage = 450; // 45%
const std_blocksUntilMaturity = 40;

contract('TheHodlersDotClub', function(accounts) {
  const founder = accounts[0];
  const lighthouseKeeper = accounts[1];
  const anyone = accounts[2];

  const hodler1 = accounts[4];
  let hodler1Maturity;

  const immature1 = accounts[6];
  let immature1Maturity;

  it("should allow setting maturity", function() {
    let contract;
    let lighthouse;
    return TheHodlersDotClub.deployed().then(function(instance) {
      contract = instance;
      return Lighthouse.deployed();
    }).then(function(instance) {
      lighthouse = instance;

      return lighthouse.addKeeper(lighthouseKeeper, {from: founder});
    }).then(function() {

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: std_minBuyIn});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'ClubInitialized');

      return contract.joinClub({from: hodler1, value: std_minBuyIn});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewHodler');
      hodler1Maturity = evt.args._maturityBlock;
    }).then(blockMiner.mineBlocks(anyone, std_blocksUntilMaturity / 2)).then(function() {
      return contract.joinClub({from: immature1, value: std_minBuyIn});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewHodler');
      immature1Maturity = evt.args._maturityBlock;

      assert.isAbove(immature1Maturity.valueOf(), hodler1Maturity.valueOf());

      return contract.setSenderMature({from: hodler1});
    }).then(function(tx) {
      failOnFoundEvent(tx, 'HodlerIsNowMature');
    }).then(blockMiner.mineBlocks(anyone, std_blocksUntilMaturity / 2)).then(function() {
      return contract.setSenderMature({from: hodler1});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'HodlerIsNowMature');

      return lighthouse.setPrice(std_minPrice + 1, {from: lighthouseKeeper});
    }).then(function() {
      return contract.setSenderMature({from: immature1});
    }).then(function(tx) {
      failOnFoundEvent(tx, 'HodlerIsNowMature');

      return contract.setSenderMature({from: immature1});
    }).then(function(tx) {
      failOnFoundEvent(tx, 'HodlerIsNowMature');

    }).then(blockMiner.mineBlocks(anyone, std_blocksUntilMaturity)).then(function() {
      return contract.getStatus.call({});
    }).then(function(result) {
      const status = new ClubStatus(result);
      assert.equal(1, status.numberOfMatureHodlers);

      return contract.setSenderMature({from: founder});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'HodlerIsNowMature');

      return contract.getStatus.call({});
    }).then(function(result) {
      const status = new ClubStatus(result);
      assert.equal(2, status.numberOfMatureHodlers);
    });
  });
});

contract('TheHodlersDotClub', function(accounts) {
  const admin = accounts[0];
  const founder = accounts[9];
  const lighthouseKeeper = accounts[1];
  const anyone = accounts[2];
  const coward1 = accounts[3];
  let coward1BeforeLeavingBalance;

  const hodler1 = accounts[4];
  let hodler1Maturity;
  let hodler1Balance;

  const immature1 = accounts[6];
  let immature1Maturity;

  it("leaving early should result in a penalty, but not leaving after", function() {
    let contract;
    let lighthouse;
    return TheHodlersDotClub.deployed().then(function (instance) {
      contract = instance;
      return Lighthouse.deployed();
    }).then(function (instance) {
      lighthouse = instance;

      return lighthouse.addKeeper(lighthouseKeeper, {from: admin});
    }).then(function() {
      return lighthouse.setPrice(75, {from: lighthouseKeeper});
    }).then(function() {

      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: std_minBuyIn});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'ClubInitialized');

      return contract.queryLighthouse({from: anyone});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewPriceFromLighthouse');
      assert.equal(75, evt.args._priceInUsdCents);
      assert.equal(false, evt.args._priceHasBeenReached);

      return contract.joinClub({from: hodler1, value: std_minBuyIn});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewHodler');
      hodler1Maturity = evt.args._maturityBlock;

    }).then(blockMiner.mineBlocks(anyone, std_blocksUntilMaturity - 2)).then(function() {

      return contract.joinClub({from: immature1, value: std_minBuyIn});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewHodler');
      immature1Maturity = evt.args._maturityBlock;

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

      return lighthouse.setPrice(std_minPrice + 1, {from: lighthouseKeeper});
    }).then(function() {
      return contract.queryLighthouse({from: anyone});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'NewPriceFromLighthouse');
      assert.equal(true, evt.args._priceHasBeenReached);

      return contract.setSenderMature({from: founder});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'HodlerIsNowMature');

      return contract.leaveClub({from: immature1});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'ImmatureHodlerLeftClub');
      assert.equal(std_minBuyIn, evt.args._withdrawn);

      return contract.setSenderMature({from: hodler1});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'HodlerIsNowMature');
      assert.equal(2, evt.args._numberOfMatureHodlers);

      return contract.getHodlerInfo(hodler1);
    }).then(function(result) {
      const hodlerInfo = new HodlerInfo(result);
      assert.equal(true, hodlerInfo.isMature);
      assert.equal(std_minBuyIn, hodlerInfo.hodling);

      hodler1Balance = web3.eth.getBalance(hodler1);

      return contract.leaveClub({from: hodler1, gasPrice: web3.toWei(1.5, 'gwei')});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'HodlerLeftClub');

      assert.equal(std_minBuyIn, evt.args._hodling);
      assert.equal(
          web3.toBigNumber("675000000000000000").valueOf(),
          evt.args._bonus.valueOf());

      let gasPrice = web3.toWei(1.5, 'gwei');
      let costOfGas = gasPrice * tx.receipt.gasUsed;
      const expected = hodler1Balance
          .add(evt.args._hodling)
          .add(evt.args._bonus)
          .sub(costOfGas);
      assert.equal(expected.valueOf(), web3.eth.getBalance(hodler1).valueOf());

      return contract.leaveClub({from: founder, gasPrice: web3.toWei(1.5, 'gwei')});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'HodlerLeftClub');

      assert.equal(founder, evt.args._hodler);
      assert.equal(std_minBuyIn, evt.args._hodling);
      assert.equal(
          web3.toBigNumber("675000000000000000").valueOf(),
          evt.args._bonus.valueOf());

      return contract.leaveClub({from: hodler1, gasPrice: web3.toWei(1.5, 'gwei')})
          .then(assert.fail)
          .catch(expectedCatch);
    }).then(function() {

      return contract.getStatus.call({});
    }).then(function(result) {
      const status = new ClubStatus(result);
      assert.equal(web3.toBigNumber('150000000000000000').valueOf(), status.adminPool.valueOf());
      assert.equal(web3.toBigNumber('1350000000000000000').valueOf(), status.hodlersPool.valueOf());

      return contract.adminWithdraw({from: admin});
    }).then(function() {
      assert.equal(0, web3.eth.getBalance(contract.address).valueOf());
    });
  });
});
