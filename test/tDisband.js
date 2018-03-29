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

  const voter1 = accounts[3];
  const voter2 = accounts[4];
  const voter3 = accounts[5];
  const voter4 = accounts[6];

  it("should allow only mature members and the founder to vote to disband", function() {
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

      return Promise.all([
        contract.joinClub({from: voter1, value: std_minBuyIn}),
        contract.joinClub({from: voter2, value: std_minBuyIn}),
        contract.joinClub({from: voter3, value: std_minBuyIn}),
        contract.joinClub({from: voter4, value: std_minBuyIn})
      ]);
    }).then(function(txs) {
      txs.forEach(tx => findEventByNameOrFail(tx, 'NewHodler'));

      return contract.voteToDisband({from: voter1})
          .then(assert.fail)
          .catch(expectedCatch);
    }).then(function() {

      // the founder, even if not mature, should always be able to vote
      return contract.voteToDisband(true, {from: founder});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx,'VoteToDisband');
      assert.equal(founder, evt.args._hodler);
      assert.equal(true, evt.args._votedToDisband);
      assert.equal(1, evt.args._numberOfVotesToDisband);
      assert.equal(2, evt.args._numberNeededToDisband.valueOf());
      assert.equal(false, evt.args._isDisbanded);

      return contract.voteToDisband(false, {from: founder});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx,'VoteToDisband');
      assert.equal(founder, evt.args._hodler);
      assert.equal(false, evt.args._votedToDisband);
      assert.equal(0, evt.args._numberOfVotesToDisband);
      assert.equal(2, evt.args._numberNeededToDisband.valueOf());
      assert.equal(false, evt.args._isDisbanded);

      return contract.voteToDisband(true, {from: voter1})
          .then(assert.fail)
          .catch(expectedCatch);
    }).then(blockMiner.mineBlocks(anyone, std_blocksUntilMaturity)).then(function() {
      return contract.setSenderMature({from: voter1});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'HodlerIsNowMature');

      return contract.voteToDisband(true, {from: voter1});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx,'VoteToDisband');
      assert.equal(voter1, evt.args._hodler);
      assert.equal(true, evt.args._votedToDisband);
      assert.equal(1, evt.args._numberOfVotesToDisband);
      assert.equal(2, evt.args._numberNeededToDisband.valueOf());
      assert.equal(false, evt.args._isDisbanded);

      return contract.setSenderMature({from: voter2});
    }).then(function() {
      return contract.voteToDisband(true, {from: voter2});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx,'VoteToDisband');
      assert.equal(voter2, evt.args._hodler);
      assert.equal(true, evt.args._votedToDisband);
      assert.equal(2, evt.args._numberOfVotesToDisband);
      assert.equal(2, evt.args._numberNeededToDisband.valueOf());
      assert.equal(true, evt.args._isDisbanded);

      return contract.getStatus.call({})
    }).then(function(result) {
      const status = new ClubStatus(result);
      assert.equal(true, status.isDisbanded);
      assert.equal(2, status.numberOfVotesToDisband);
    });
  });
});



contract('TheHodlersDotClub', function(accounts) {
  const admin = accounts[0];
  let adminBalance;
  const founder = accounts[9];
  const lighthouseKeeper = accounts[1];
  const anyone = accounts[2];

  const voter1 = accounts[3];
  const voter2 = accounts[4];
  const voter3 = accounts[5];
  const voter4 = accounts[6];

  const coward = accounts[7];

  it("should send back only hodlings if disbanded", function() {
    let contract;
    let lighthouse;
    return TheHodlersDotClub.deployed().then(function(instance) {
      contract = instance;
      return Lighthouse.deployed();
    }).then(function(instance) {
      lighthouse = instance;

      return lighthouse.addKeeper(lighthouseKeeper, {from: admin});
    }).then(function() {
      return contract.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: std_minBuyIn});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'ClubInitialized');

      return Promise.all([
        contract.joinClub({from: voter1, value: std_minBuyIn}),
        contract.joinClub({from: voter2, value: std_minBuyIn}),
        contract.joinClub({from: voter3, value: std_minBuyIn}),
        contract.joinClub({from: voter4, value: std_minBuyIn}),
        contract.joinClub({from: coward, value: web3.toWei(6, 'ether')})
      ]);
    }).then(function(txs) {
      txs.forEach(tx => findEventByNameOrFail(tx, 'NewHodler'));

      return contract.leaveClub({from: coward});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'CowardLeftClub');

      // the founder, even if not mature, should always be able to vote
      return contract.voteToDisband(true, {from: founder});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx,'VoteToDisband');
      assert.equal(founder, evt.args._hodler);
      assert.equal(true, evt.args._votedToDisband);
      assert.equal(1, evt.args._numberOfVotesToDisband);
      assert.equal(2, evt.args._numberNeededToDisband.valueOf());
      assert.equal(false, evt.args._isDisbanded);

    }).then(blockMiner.mineBlocks(anyone, std_blocksUntilMaturity)).then(function() {
      return contract.setSenderMature({from: voter1});
    }).then(function(tx) {
      findEventByNameOrFail(tx, 'HodlerIsNowMature');

      return contract.voteToDisband(true, {from: voter1});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx,'VoteToDisband');
      assert.equal(voter1, evt.args._hodler);
      assert.equal(true, evt.args._votedToDisband);
      assert.equal(2, evt.args._numberOfVotesToDisband);
      assert.equal(2, evt.args._numberNeededToDisband.valueOf());
      assert.equal(true, evt.args._isDisbanded);

      return contract.getStatus.call({})
    }).then(function(result) {
      const status = new ClubStatus(result);
      assert.equal(true, status.isDisbanded);
      assert.equal(2, status.numberOfVotesToDisband);
      assert.equal(web3.toWei(3, 'ether').valueOf(), status.adminPool.valueOf());
      assert.equal(0, status.hodlersPool);

      return contract.leaveClub({from: voter1});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'HodlerLeftClub');
      assert.equal(std_minBuyIn, evt.args._hodling);
      assert.equal(0, evt.args._bonus);

      adminBalance = web3.eth.getBalance(admin);
      return contract.adminWithdraw({from: admin, gasPrice: web3.toWei(1.5, 'gwei')});
    }).then(function(tx) {

      let gasPrice = web3.toWei(1.5, 'gwei');
      let costOfGas = gasPrice * tx.receipt.gasUsed;
      const expected = adminBalance
          .add(web3.toWei(3, 'ether'))
          .sub(costOfGas);

      assert.equal(expected.valueOf(), web3.eth.getBalance(admin).valueOf());
    });
  });
});
