var PriceInUsdLighthouse = artifacts.require('./PriceInUsdLighthouse.sol');
var TheHodlersDotClub = artifacts.require('./TheHodlersDotClub.sol');
var ClubFactory = artifacts.require('./ClubFactory.sol');
var BlockMiner = artifacts.require('./BlockMiner.sol');

module.exports = function(deployer) {
  deployer.deploy(BlockMiner);
  deployer.deploy(PriceInUsdLighthouse);
  deployer.link(PriceInUsdLighthouse, TheHodlersDotClub);
  deployer.deploy(TheHodlersDotClub);
  deployer.deploy(ClubFactory);
};
