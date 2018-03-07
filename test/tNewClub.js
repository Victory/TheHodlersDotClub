var TheHodlersDotClub = artifacts.require("./TheHodlersDotClub.sol");

contract('TheHodlerDotClub', function(accounts) {
  var owner = accounts[0];
  it("should deploy", function() {
    var contract;
    return TheHodlersDotClub.deployed().then(function(instance) {
      contract = instance;
    }).then(function() {
    });
  });
});