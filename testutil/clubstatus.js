instance = {};

instance.ClubStatus = function(result) {
  this.minPrice = result[0];
  this.minBuyIn = result[1];
  this.penaltyPercentage = result[2];
  this.blocksUntilMaturity = result[3];
  this.founded = result[4];
  this.priceHasBeenReached = result[5];
  this.lighthouse = result[6];
  this.adminPool = result[7];
  this.hodlersPool = result[8];
  this.numberOfMatureHodlers = result[9];
};

instance.HodlerInfo = function(result) {
  this.blockJoined = result[0];
  this.maturityBlock = result[1];
  this.hodling = result[2];
  this.isMature = result[3];
};

module.exports = instance;
