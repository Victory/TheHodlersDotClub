var PriceInUsdLighthouse = artifacts.require('./PriceInUsdLighthouse.sol');
var TheHodlersDotClub = artifacts.require('./TheHodlersDotClub.sol');
var BlockMiner = artifacts.require('./BlockMiner.sol');

module.exports = function(deployer) {
  deployer.deploy(BlockMiner);
  deployer.deploy(PriceInUsdLighthouse);
  deployer.link(PriceInUsdLighthouse, TheHodlersDotClub);
  deployer.deploy(TheHodlersDotClub);
};
