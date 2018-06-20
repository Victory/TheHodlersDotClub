var getAddressFromQuery = function() {
  var q = document.location.search;
  var target = "clubAddress=";

  var labelIndex = q.indexOf(target);

  if (labelIndex < 0) {
    return undefined;
  }

  var start = labelIndex + target.length;

  var addr = q.substr(start, 42);

  return (addr.match(/^0x[0-9a-f]+$/) && addr.length == 42) ? addr : undefined;
};

var showTxModal;
jQuery(function($) {

  var $txModal = $("#txModal");
  showTxModal = function(tx) {
    $txModal.find('[thdc-tx]').html(THDC.utils.linkToTx(tx));
    $txModal.removeClass('hide');
  };

  var clubAddress = getAddressFromQuery();
  if (!clubAddress) {
    document.body.innerHTML = "404 not found";
  }

  $('[c-club-address]').html(THDC.utils.linkToAddress(clubAddress));

  var contract = web3.eth.contract(contracts.club.abi);
  var Club = contract.at(clubAddress);

  Club.getStatus(function(err, result) {
    onError(err);
    var status = new ClubStatus(result);

    $('[c-club-info=minPrice]').text(parseFloat(status.minPrice) / 100.0 + " USD");
    $('[c-club-info=minBuyIn]').text(web3.fromWei(status.minBuyIn, 'ether') + " " + network.units);
    $('[c-club-info=penaltyPercentage]').text((status.penaltyPercentage /10) + "%");
    $('[c-club-info=blocksUntilMaturity]').text((status.blocksUntilMaturity));
    $('[c-club-info=founded]').text(status.founded);
    $('[c-club-info=priceHasBeenReached]').text(status.priceHasBeenReached);

    $('body').on('click', '[c-join-club]', function(evt) {
      evt.preventDefault();
      Club.joinClub({value: status.minBuyIn}, function(err, tx) {
        onError(err);
        showTxModal(tx);
      });
    });
  });

  /*
  $('body').on('click', '[c-join-club]', function(evt) {
    evt.preventDefault();
    Club.joinClub({value: minBuyIn});
  });
  */
});