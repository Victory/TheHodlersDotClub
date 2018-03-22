const PriceInUsdLighthouse = artifacts.require("./PriceInUsdLighthouse.sol");
const findEventByNameOrThrow = require('../testutil/txutil.js').findEventByNameOrThrow;

const expectedCatch = function() {
  assert.isOk(true);
};

contract('PriceInUsdLighthouse', function(accounts) {
  const owner = accounts[0];
  const keeper1 = accounts[2];

  it("should deploy", function () {
    let contract;
    return PriceInUsdLighthouse.deployed().then(function (instance) {
      contract = instance;
    }).then(function () {
      assert.isOk(true, "Couldn't deploy");
    });
  });

  it("should let keepers to set price", function () {
    let contract;
    return PriceInUsdLighthouse.deployed().then(function (instance) {
      contract = instance;
      return contract.getKeepers.call({});
    }).then(function (result) {
      assert.strictEqual(0, result.indexOf(owner), "owner should be the 0th keeper");

      return contract.setPrice(210, {from: owner});
    }).then(function (tx) {
      let evt = findEventByNameOrThrow(tx, "PriceUpdated");
      assert.equal(210, evt.args._priceInUsdCents);

      return contract.getPrice.call({});
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
      let evt = findEventByNameOrThrow(tx, "NewKeeper");
      assert.equal(owner, evt.args._sender);
      assert.equal(keeper1, evt.args._newKeeper);

      return contract.setPrice(410, {from: keeper1});
    }).then(function (tx) {
      let evt = findEventByNameOrThrow(tx, "PriceUpdated");
      assert.equal(keeper1, evt.args._sender);
      assert.equal(410, evt.args._priceInUsdCents);
    });
  });
});

contract('PriceInUsdLighthouse', function(accounts) {
  const owner = accounts[0];
  const keeper1 = accounts[2];
  const keeper2 = accounts[3];
  const keeper3 = accounts[4];
  const keeper4 = accounts[5];
  const keeper5 = accounts[6];

  it("should allow adding and removing keepers", function() {
    let contract;
    return PriceInUsdLighthouse.deployed().then(function(instance) {
      contract = instance;
      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(result, owner);
      return contract.addKeeper(keeper1, {from: owner});
    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'NewKeeper');
      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(result, owner);
      assert.include(result, keeper1);
      return contract.addKeeper(keeper2, {from: owner});
    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'NewKeeper');
      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(result, owner);
      assert.include(result, keeper1);
      assert.include(result, keeper2);
      return contract.addKeeper(keeper3, {from: owner});
    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'NewKeeper');
      return contract.addKeeper(keeper4, {from: owner});
    }).then(function(tx) {
      findEventByNameOrThrow(tx, 'NewKeeper');
      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(result, owner);
      assert.include(result, keeper1);
      assert.include(result, keeper2);
      assert.include(result, keeper3);
      assert.include(result, keeper4);

      return contract.addKeeper(keeper5, {from: owner});
    }).then(function(tx) {
      var evt = findEventByNameOrThrow(tx, 'ErrorTooManyKeepers');
      assert.equal(keeper5, evt.args._newKeeper);

      return contract.addKeeper(keeper1, {from: owner});
    }).then(function(tx) {
      var evt = findEventByNameOrThrow(tx, 'ErrorAlreadyAKeeper');
      assert.equal(keeper1, evt.args._newKeeper);

      return contract.removeKeeper(keeper1, {from: owner});
    }).then(function(tx) {
      var evt = findEventByNameOrThrow(tx, 'KeeperRemoved');
      assert.equal(keeper1, evt.args._removedKeeper);

      return contract.removeKeeper(owner, {from: owner});
    }).then(function(tx) {
      var evt = findEventByNameOrThrow(tx, 'KeeperRemoved');
      assert.equal(owner, evt.args._removedKeeper);

      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(result, keeper2);
      assert.include(result, keeper3);
      assert.include(result, keeper4);

      return contract.removeKeeper(keeper4, {from: owner});
    }).then(function(tx) {
      var evt = findEventByNameOrThrow(tx, 'KeeperRemoved');
      assert.equal(keeper4, evt.args._removedKeeper);

      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(result, keeper2);
      assert.include(result, keeper3);

      return contract.removeKeeper(keeper3, {from: owner});
    }).then(function(tx) {
      var evt = findEventByNameOrThrow(tx, 'KeeperRemoved');
      assert.equal(keeper3, evt.args._removedKeeper);

      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(result, keeper2);

      return contract.removeKeeper(keeper2, {from: owner})
          .then(assert.fail)
          .catch(expectedCatch);
    }).then(function() {
      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.include(result, keeper2);
    });
  });
});

contract('PriceInUsdLighthouse', function(accounts) {
  const owner = accounts[0];
  const custodian1 = accounts[1];
  const custodian2 = accounts[2];
  const nobody = accounts[3];

  it("should allow the owner to add and remove custodians", function() {
    let contract;
    return PriceInUsdLighthouse.deployed().then(function (instance) {
      contract = instance;
      contract.addCustodian(custodian1, {from: owner});
    }).then(function () {
      return contract.removeCustodian(custodian1, {from: owner});
    }).then(function () {
      return contract.addCustodian(custodian2, {from: owner});
    });
  });

  it("should not allow others to add or remove custodians", function() {
    let contract;
    return PriceInUsdLighthouse.deployed().then(function (instance) {
      contract = instance;

      return contract.addCustodian(custodian1, {from: nobody})
          .then(assert.fail)
          .catch(expectedCatch);
    }).then(function () {
      return contract.removeCustodian(custodian1, {from: nobody})
          .then(assert.fail)
          .catch(expectedCatch);
    });
  });
});



contract('PriceInUsdLighthouse', function(accounts) {
  const owner = accounts[0];
  const keeper1 = accounts[1];
  const keeper2 = accounts[2];
  const keeper3 = accounts[3];
  const donator1 = accounts[4];
  const donator2 = accounts[5];

  let keeper1balance;

  it("should let keepers withdraw", function() {
    let contract;
    return PriceInUsdLighthouse.deployed().then(function(instance) {
      contract = instance;
      return contract.addKeeper(keeper1, {from: owner});
    }).then(function() {
      return contract.removeKeeper(owner, {from: owner});
    }).then(function() {
      return Promise.all([
          contract.addKeeper(keeper2, {from: owner}),
          contract.addKeeper(keeper3, {from: owner})
      ]);
    }).then(function() {
      return Promise.all([
        contract.donate({from: donator1, value: web3.toWei(15, 'ether')}),
        contract.donate({from: donator2, value: web3.toWei(15, 'ether')})
      ]);
    }).then(function() {
      return web3.eth.getBalance(contract.address);
    }).then(function(result) {
      assert.equal(web3.toWei(30, 'ether'), result);

      return contract.splitShares({from: keeper1});
    }).then(function() {
      return contract.checkShares.call({from: keeper1});
    }).then(function(result) {
      assert.equal(web3.toWei(10, 'ether'), result);

      return contract.checkShares.call({from: keeper2});
    }).then(function(result) {
      assert.equal(web3.toWei(10, 'ether'), result);

      return contract.checkShares.call({from: keeper3});
    }).then(function(result) {
      assert.equal(web3.toWei(10, 'ether'), result);

      keeper1balance = web3.eth.getBalance(keeper1);
      return contract.withdraw({from: keeper1, gasPrice: web3.toWei(1.5, 'gwei')});
    }).then(function(tx) {
      let gasPrice = web3.toWei(1.5, 'gwei');
      let costOfGas = gasPrice * tx.receipt.gasUsed;
      let expected = keeper1balance.sub(costOfGas).add(web3.toWei(10, 'ether'));
      let actual = web3.eth.getBalance(keeper1);
      assert.equal(expected.valueOf(), actual.valueOf());
      assert.equal('20', web3.fromWei(web3.eth.getBalance(contract.address), 'ether'));
      return contract.withdraw({from: keeper1, gasPrice: web3.toWei(1.5, 'gwei')});
    }).then(function(tx) {
      assert.equal('20', web3.fromWei(web3.eth.getBalance(contract.address), 'ether'));
      return contract.withdraw({from: keeper2, gasPrice: web3.toWei(1.5, 'gwei')});
    }).then(function(tx) {
      assert.equal('10', web3.fromWei(web3.eth.getBalance(contract.address), 'ether'));
      return contract.withdraw({from: keeper3, gasPrice: web3.toWei(1.5, 'gwei')});
    }).then(function(tx) {
      assert.equal('0', web3.fromWei(web3.eth.getBalance(contract.address), 'ether'));
    });
  });
});
