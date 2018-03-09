var PriceInUsdLighthouse = artifacts.require("./PriceInUsdLighthouse.sol");

contract('PriceInUsdLighthouse', function(accounts) {
  var owner = accounts[0];
  var nobody = accounts[1];

  it("should deploy", function() {
    var contract;
    return PriceInUsdLighthouse.deployed().then(function(instance) {
      contract = instance;
    }).then(function() {
      assert.isOk(true, "Couldn't deploy");
    });
  });

  it("should let owner set price", function() {
    var contract;
    return PriceInUsdLighthouse.deployed().then(function(instance) {
      contract = instance;
      return contract.getKeepers.call({});
    }).then(function(result) {
      assert.strictEqual(0, result.indexOf(owner), "owner should be the 0th keeper");
      return contract.setPrice(210, {from: owner});
    }).then(function(tx) {
      assert.equal(210, tx.logs[0].args._priceInUsd);
      return contract.getPrice.call();
    }).then(function(result) {
      assert.equal(210, result);
    });
  });
});
