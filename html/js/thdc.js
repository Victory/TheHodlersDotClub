THDC = {
  utils: {}
};

function onError(err) {
  if (err === null) return;
  try {
    console.trace();
  } catch (e) {}
  console.log(err);
  throw "general error";
}


THDC.utils.linkToTx = function(tx) {
  var href = network.explorerTx + tx;
  try {
    var text = tx.substr(0, 10) + "..." + tx.substr(-10);
  } catch (e) {
    return "Login to MetaMask";
  }
  return $("<a>", {
    target: "_blank",
    title: tx,
    href: href,
    "class": "tx",
    text: text
  }).prop("thdc-tx", true);
};

THDC.utils.linkToAddress = function(address) {
  var href = network.explorerAddr + address;
  try {
    var text = address.substr(0, 8) + "..." + address.substr(-8);
  } catch (e) {
    return null;
  }
  return $("<a>", {
    target: "_blank",
    title: address,
    href: href,
    "class": "wallet-address",
    text: text
  }).prop("thdc-wallet-address", true);
};

$('body').on('click', '[data-dismiss=modal]', function () {
  $(this).parents('.modal').addClass('hide');
});


$('body').on('click', '.modal', function (evt) {
  var $target = $(evt.target);
  if (evt.target == this || $target.hasClass('modal-dialog')) {
    $(this).addClass('hide');
  }
});


$('body').on('click', '[c-create-contract-button]', function() {
  var contract = web3.eth.contract(contracts.factory.abi);
  var ClubFactory = contract.at(contracts.factory.address);

  ClubFactory.createClub(function(err, tx) {
    onError(err);
    showTxModal(tx);
  });
});

$('body').on('click', '[c-found-club-button]', function() {
  var $form = $(this).parents('[c-found-club]');

  // TODO Sanitize
  var clubAddress = $form.find('[name=clubAddress]').val();
  var minPrice = 100 * parseFloat($form.find('[name=targetPrice]').val());
  var minBuyInFloat = parseFloat($form.find('[name=minBuyIn]').val());
  var minBuyIn = web3.toWei(minBuyInFloat, 'ether');
  var penaltyPercentage = 10 * parseFloat($form.find('[name=penaltyPercentage]').val());
  var blocksUntilMaturity = parseInt($form.find('[name=blocksUntilMaturity]').val());
  var lighthouse = $form.find('[name=lighthouse]').val();

  debugger;

  var contract = web3.eth.contract(contracts.club.abi);
  var Club = contract.at(clubAddress);
  Club.foundClub(minPrice, minBuyIn, penaltyPercentage, blocksUntilMaturity, lighthouse,
      {value: minBuyIn},
      function(err, tx) {

  });
});



jQuery(function() {

  var $txModal = $("#txModal");
  var showTxModal = function(tx) {
    $txModal.find('[thdc-tx]').html(THDC.utils.linkToTx(tx));
    $txModal.removeClass('hide');
  };

  $('[name=lighthouse]').val(contracts.lighthouse.address);

});