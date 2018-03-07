var PriceInUsdLighthouse = artifacts.require("./PriceInUsdLighthouse.sol");
var TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");

module.exports = function(deployer) {
  deployer.deploy(PriceInUsdLighthouse);
  deployer.link(PriceInUsdLighthouse, TheHodlersDotClub);
  deployer.deploy(TheHodlersDotClub);
};
