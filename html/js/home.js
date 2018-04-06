var network = {
  longName: 'Pirl',
  units: 'PIRL',
  net: 'http://wallrpc.pirl.io/',
  number: '3125659152',
  explorerHome: 'https://poseidon.pirl.io/',
  explorerAddr: 'https://poseidon.pirl.io/explorer/address/',
  explorerTx: 'https://poseidon.pirl.io/explorer/transaction/',

};

var contracts = {
  factory: {
    address: '0xae2a0b54f3adf2a678efac69f9d26cbaef771ff9',
    abi: [{"constant":true,"inputs":[],"name":"getAdmin","outputs":[{"name":"_admin","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getClubs","outputs":[{"name":"","type":"address[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newAdmin","type":"address"}],"name":"newAdmin","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"createClub","outputs":[{"name":"_club","type":"address"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_founder","type":"address"},{"indexed":false,"name":"_admin","type":"address"},{"indexed":false,"name":"_club","type":"address"}],"name":"ClubCreated","type":"event"}]
  },
  lighthouse: {
    address: '0xdd3a294310dbd8b53feee7ca1e1205062fe5d066',
    abi: [{"constant":false,"inputs":[{"name":"_custodianToRemove","type":"address"}],"name":"removeCustodian","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_keeperToRemove","type":"address"}],"name":"removeKeeper","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getState","outputs":[{"name":"_priceInUsdCents","type":"uint256"},{"name":"_lastPriceUpdateBlockNumber","type":"uint256"},{"name":"_lastPriceSetBy","type":"address"},{"name":"_donations","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_custodian","type":"address"}],"name":"isCustodian","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getPriceAndWhen","outputs":[{"name":"_priceInUsdCents","type":"uint256"},{"name":"_lastPriceUpdateBlockNumber","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newKeeper","type":"address"}],"name":"addKeeper","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newCustodian","type":"address"}],"name":"addCustodian","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_priceInUsdCents","type":"uint256"}],"name":"setPrice","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"splitShares","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"checkShares","outputs":[{"name":"_shares","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getKeepers","outputs":[{"name":"_keepers","type":"address[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"donate","outputs":[],"payable":true,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"},{"indexed":false,"name":"_newKeeper","type":"address"}],"name":"NewKeeper","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"},{"indexed":false,"name":"_removedKeeper","type":"address"}],"name":"KeeperRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"},{"indexed":false,"name":"_priceInUsdCents","type":"uint256"}],"name":"PriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"},{"indexed":false,"name":"_lastPriceSetBy","type":"address"},{"indexed":false,"name":"_priceInUsdCents","type":"uint256"}],"name":"ErrorPriceUpdatedTooSoon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"},{"indexed":false,"name":"_newKeeper","type":"address"}],"name":"ErrorAlreadyAKeeper","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"},{"indexed":false,"name":"_newKeeper","type":"address"}],"name":"ErrorTooManyKeepers","type":"event"}]
  },
  club: {
    abi: [{"constant":true,"inputs":[],"name":"getStatus","outputs":[{"name":"_minPrice","type":"uint256"},{"name":"_minBuyIn","type":"uint256"},{"name":"_penaltyPercentage","type":"uint256"},{"name":"_blocksUntilMaturity","type":"uint256"},{"name":"_founded","type":"bool"},{"name":"_priceHasBeenReached","type":"bool"},{"name":"_lighthouse","type":"address"},{"name":"_adminPool","type":"uint256"},{"name":"_hodlersPool","type":"uint256"},{"name":"_numberOfMatureHodlers","type":"uint256"},{"name":"_isDisbanded","type":"bool"},{"name":"_numberOfVotesToDisband","type":"uint256"},{"name":"_admin","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_who","type":"address"}],"name":"isHodler","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_minPrice","type":"uint256"},{"name":"_minBuyIn","type":"uint256"},{"name":"_penaltyPercentage","type":"uint256"},{"name":"_blocksUntilMaturity","type":"uint256"},{"name":"_lighthouse","type":"address"}],"name":"foundClub","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[],"name":"setSenderMature","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newAdmin","type":"address"}],"name":"newAdmin","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_votedToDisband","type":"bool"}],"name":"voteToDisband","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"queryLighthouse","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"leaveClub","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_hodler","type":"address"}],"name":"setMature","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getHodlers","outputs":[{"name":"","type":"address[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"joinClub","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"_hodler","type":"address"}],"name":"getHodlerInfo","outputs":[{"name":"_blockJoined","type":"uint256"},{"name":"_maturityBlock","type":"uint256"},{"name":"_hodling","type":"uint256"},{"name":"_isMature","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"adminWithdraw","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_founder","type":"address"},{"indexed":false,"name":"_minPrice","type":"uint256"},{"indexed":false,"name":"_minBuyIn","type":"uint256"},{"indexed":false,"name":"_penaltyPercentage","type":"uint256"},{"indexed":false,"name":"_blocksUntilMaturity","type":"uint256"},{"indexed":false,"name":"_lighthouse","type":"address"}],"name":"ClubInitialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_hodler","type":"address"},{"indexed":false,"name":"_hodling","type":"uint256"},{"indexed":false,"name":"_maturityBlock","type":"uint256"}],"name":"NewHodler","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_hodler","type":"address"},{"indexed":false,"name":"_increase","type":"uint256"},{"indexed":false,"name":"_hodling","type":"uint256"}],"name":"HolderLevelIncreased","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_inquirer","type":"address"},{"indexed":false,"name":"_priceInUsdCents","type":"uint256"},{"indexed":false,"name":"_priceHasBeenReached","type":"bool"}],"name":"NewPriceFromLighthouse","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_hodler","type":"address"},{"indexed":false,"name":"_txSender","type":"address"},{"indexed":false,"name":"_numberOfMatureHodlers","type":"uint256"}],"name":"HodlerIsNowMature","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_coward","type":"address"},{"indexed":false,"name":"_sentToAdminPool","type":"uint256"},{"indexed":false,"name":"_sentToHodlersPool","type":"uint256"},{"indexed":false,"name":"_withdrawn","type":"uint256"}],"name":"CowardLeftClub","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_hodler","type":"address"},{"indexed":false,"name":"_withdrawn","type":"uint256"}],"name":"ImmatureHodlerLeftClub","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_hodler","type":"address"},{"indexed":false,"name":"_hodling","type":"uint256"},{"indexed":false,"name":"_bonus","type":"uint256"}],"name":"HodlerLeftClub","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_hodler","type":"address"},{"indexed":false,"name":"_votedToDisband","type":"bool"},{"indexed":false,"name":"_numberOfVotesToDisband","type":"uint256"},{"indexed":false,"name":"_numberNeededToDisband","type":"uint256"},{"indexed":false,"name":"_isDisbanded","type":"bool"}],"name":"VoteToDisband","type":"event"}]
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
    window.isInjectedWeb3Provider = true;

    var net = network.net;
    window.web3evts = new Web3(new Web3.providers.HttpProvider(net));
  } else {
    console.log('No web3? You should consider trying MetaMask!');
    window.isInjectedWeb3Provider = false;
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    var net = network.net;
    window.web3 = new Web3(new Web3.providers.HttpProvider(net));
    window.web3evts = window.web3;
  }

  var $network = $("[ktc-network-name]");

  web3.version.getNetwork(function(err, netId) {
    switch (netId) {
      case '3125659152':
        if (network.number != '3125659152') {
          $('#rpcError').modal('show');
        }
        $network.text('PIRL');
        break;
      default:
        $network.text('This is an unknown network.');
    }

    $('[c-network-long-name]').text(network.longName);
    $('[c-network-units]').html(network.units);
    $('[c-net]').html(network.net);
    $('[c-explorer-home]').attr('href', network.explorerHome);

    var contract = web3.eth.contract(contracts.factory.abi);
    window.ClubFactory = contract.at(contracts.factory.address);
  });


  $('body').on('mouseover', '[c-info]', function() {
    $(this).find('[c-info-icon]').addClass('hide');
    $(this).find('[c-info-info]').removeClass('hide');
  }).on('mouseout', '[c-info]', function() {
    $(this).find('[c-info-icon]').removeClass('hide');
    $(this).find('[c-info-info]').addClass('hide');
  });
});

