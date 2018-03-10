var PriceInUsdLighthouse = artifacts.require("./PriceInUsdLighthouse.sol");
const findEventByNameOrThrow = require('../testutil/txutil.js').findEventByNameOrThrow;
const blockMiner = require('../testutil/blockminer');

const expectedCatch = function() {
  assert.isOk(true);
};

contract('PriceInUsdLighthouse', function(accounts) {
  var owner = accounts[0];
  var keeper1 = accounts[2];

  it("should deploy", function () {
    var contract;
    return PriceInUsdLighthouse.deployed().then(function (instance) {
      contract = instance;
    }).then(function () {
      assert.isOk(true, "Couldn't deploy");
    });
  });

  it("should let owner set price", function () {
    var contract;
    return PriceInUsdLighthouse.deployed().then(function (instance) {
      contract = instance;
      return contract.getKeepers.call({});
    }).then(function (result) {
      assert.strictEqual(0, result.indexOf(owner), "owner should be the 0th keeper");

      return contract.setPrice(210, {from: owner});
    }).then(function (tx) {
      var evt = findEventByNameOrThrow(tx, "PriceUpdated");
      assert.equal(210, evt.args._priceInUsdCents);

      return contract.getPrice.call(undefined);
    }).then(function (result) {
      assert.equal(210, result);

      return contract.setPrice(310, {from: owner});
    }).then(function () {
      return contract.getPrice.call(undefined);
    }).then(function (result) {
      assert.equal(310, result);

      // need to be a keeper to setPrice, but keeper 1 is not yet a keeper
      return contract.setPrice(410, {from: keeper1})
          .then(assert.fail)
          .catch(expectedCatch);
    }).then(function () {
      return contract.addKeeper(keeper1, {from: owner});
    }).then(function (tx) {
      var evt = findEventByNameOrThrow(tx, "NewKeeper");
      assert.equal(owner, evt.args._sender);
      assert.equal(keeper1, evt.args._newKeeper);

      return contract.setPrice(410, {from: keeper1});
    }).then(function (tx) {
      var evt = findEventByNameOrThrow(tx, "PriceUpdated");
      assert.equal(keeper1, evt.args._sender);
      assert.equal(410, evt.args._priceInUsdCents);
    });
  });
});

contract('PriceInUsdLighthouse', function(accounts) {
  var owner = accounts[0];
  var keeper1 = accounts[2];
  var keeper2 = accounts[3];
  var keeper3 = accounts[4];
  var keeper4 = accounts[5];
  var keeper5 = accounts[6];

  it("should allow adding and removing keepers", function() {
    var contract;
    return PriceInUsdLighthouse.deployed().then(function(instance) {
      contract = instance;
      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(owner, result);
      console.log(result);
      return contract.addKeeper(keeper1, {from: owner});
    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'NewKeeper');
      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(owner, result);
      assert.include(keeper1, result);
      console.log(result);
      return contract.addKeeper(keeper2, {from: owner});
    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'NewKeeper');
      return contract.getKeepers.call({});
    }).then(function(result) {
      console.log(result);
      assert.include(owner, result);
      assert.include(keeper1, result);
      assert.include(keeper2, result);
      return contract.addKeeper(keeper3, {from: owner});
    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'NewKeeper');
      return contract.addKeeper(keeper4, {from: owner});
    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'NewKeeper');
      return contract.getKeepers.call({});
    }).then(function(result) {
      console.log(result);
    });

  });
});
