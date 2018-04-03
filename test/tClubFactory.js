const TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");
const ClubFactory = artifacts.require("./ClubFactory.sol");
const Lighthouse = artifacts.require("./PriceInUsdLighthouse.sol");

const findEventByNameOrFail = require('../testutil/txutil.js').findEventByNameOrFail;

const std_minPrice = 550;
const std_minBuyIn = web3.toWei(3, 'ether');
const std_penaltyPercentage = 450; // 45%
const std_blocksUntilMaturity = 40;

contract('ClubFactory', function(accounts) {
  const admin = accounts[0];
  const founder = accounts[1];
  const newAdmin = accounts[2];

  let clubFactoryAddress;
  let lighthouse;
  let club;

  it("should allow creating clubs", function () {
    let factory;
    return ClubFactory.deployed().then(function(instance) {
      factory = instance;
      return factory.createClub({from: founder});
    }).then(function(tx) {
      const evt = findEventByNameOrFail(tx, 'ClubCreated');

      clubFactoryAddress = evt.args._club;
      assert.equal(founder, evt.args._founder);
      assert.equal(admin, evt.args._admin);

      return Lighthouse.deployed();
    }).then(function(instance) {
      lighthouse = instance;

      club = TheHodlersDotClub.at(clubFactoryAddress);
      return club.foundClub(
          std_minPrice, std_minBuyIn, std_penaltyPercentage, std_blocksUntilMaturity, lighthouse.address,
          {from: founder, value: std_minBuyIn});
    }).then(function(tx) {
      const initEvt = findEventByNameOrFail(tx, 'ClubInitialized');
      assert.equal(founder, initEvt.args._founder);

      return Promise.all([
        factory.createClub({from: founder}),
        factory.createClub({from: founder}),
        factory.createClub({from: founder}),
        factory.createClub({from: founder})]);
    }).then(function() {

      return factory.getClubs.call({});
    }).then(function(result) {
      assert.equal(5, result.length);
      assert.include(result, clubFactoryAddress);

      return factory.getAdmin.call({});
    }).then(function(result) {
      assert.equal(admin, result);
      return factory.newAdmin(newAdmin, {from: admin});
    }).then(function() {
      return factory.getAdmin.call({});
    }).then(function(result) {
      assert.equal(newAdmin, result);
    });
  });
});
