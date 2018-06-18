THDC = {
  utils: {}
};

// == jQuery plugins ==
(function($) {
  $.fn.vModal = function(action) {

    if (action === undefined) {
      this.addClass('hide');
    } else if (action === "show") {
      this.removeClass('hide');
    } else if (action === "hide") {
      this.addClass('hide');
    }

    return this;
  };
}(jQuery));


// == misc functions ==
function onError(err) {
  if (err === null) return;
  try {
    console.trace();
  } catch (e) {}
  console.log(err);
  $("#errModal").find('[thdc-err]').text(err.message);
  $("#errModal").vModal('show');
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

var showTxModal = function(tx) {
  var $txModal = $("#txModal");
  $txModal.find('[thdc-tx]').html(THDC.utils.linkToTx(tx));
  $txModal.vModal("show");
};

// == global bindings ==
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

  ClubFactory.createClub({gasPrice: web3.toWei('3', 'gwei')}, function(err, tx) {
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


  var contract = web3.eth.contract(contracts.club.abi);
  var Club = contract.at(clubAddress);
  Club.foundClub(minPrice, minBuyIn, penaltyPercentage, blocksUntilMaturity, lighthouse,
      {value: minBuyIn, gasPrice: web3.toWei('3', 'gwei')},
      function(err, tx) {
        onError(err);
  });
});

jQuery(function() {
  $('[name=lighthouse]').val(contracts.lighthouse.address);

  var contract = web3.eth.contract(contracts.factory.abi);
  var ClubFactory = contract.at(contracts.factory.address);
  var $contractList = $('[c-your-contracts]');
  var $noContractsLi = $('[c-no-contracts-yet]');
  var knownClubs = [];

  var findClubs = function() {
    ClubFactory.getClubs(function(err, clubs) {
      onError(err);
      if (clubs.length != 0 && knownClubs.length == clubs.length) {
        return;
      }
      if (clubs.length > 0) {
        $noContractsLi.remove();
      } else {
        $noContractsLi.text('No contracts found');
      }

      clubs.forEach(function(club) {
        if (knownClubs.indexOf(club) != -1) {
          return;
        }
        knownClubs.push(club);
        var $li = $("<li>", {text: club});
        console.log(club);
        $contractList.append($li);
      });

    });
  };

  findClubs();
  setInterval(findClubs, 5000);
});