var PriceInUsdLighthouse = artifacts.require("./PriceInUsdLighthouse.sol");

contract('PriceInUsdLighthouse', function(accounts) {
  var owner = accounts[0];
  it("should deploy", function() {
    var contract;
    return PriceInUsdLighthouse.deployed().then(function(instance) {
      contract = instance;
    }).then(function() {
    });
  });
});
