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

jQuery(function() {

  var $txModal = $("#txModal");
  var showTxModal = function(tx) {
    alert(tx);
    //$txModal.find('[thdc-tx]').html(THDC.utils.linkToTx(tx));
    //$txModal.modal('show');
  };

  $('body').on('click', '[c-create-contract-button]', function() {
    ClubFactory.createClub(function(err, tx) {
      onError(err);
      showTxModal(tx);
    });
  });
});