
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
  var cGasPrice = web3.toWei(5, 'gwei');

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

  $("body").one("blocktime-block-number", function() {
    var contract = web3.eth.contract(contracts.club.abi);
    var Club = contract.at(clubAddress);

    contract = web3.eth.contract(contracts.lighthouse.abi);
    var Lighthouse;

    $('body',).on('click', '[c-set-mature]', function() {
      var hodler = web3.eth.accounts[0];
      Club.getHodlerInfo(hodler, function (err, result) {

        var info = new HodlerInfo(result);
        var blocksUntilMature = parseInt(info.maturityBlock.sub(blockTime.blockNumber).valueOf());
        blocksUntilMature = blocksUntilMature > 0 ? blocksUntilMature : 0;

        if (blocksUntilMature == 0) {
          Club.setSenderMature(function (err, tx) {
            onError(err);
            showTxModal(tx);
          });
        } else {
          onError({message: "You can not set address " + hodler + "\nmature for another " + blocksUntilMature + " blocks"});
        }
      });
    }); // end setMature

    var $hodlerInfoTablePrototype = $('[c-hodler-info-prototype]');
    $hodlerInfoTablePrototype = $hodlerInfoTablePrototype.clone();
    $('[c-hodler-info-prototype]').remove();

    Club.getHodlers(function (err, hodlers) {
      onError(err);
      var $list = $("[c-club-memebers]");
      $list.html('');

      if (hodlers.length == 0) {
        $list.html($("<tr>", {text: "Club not founded.", colspan: 5}));
      } else {
        var seenHodlers = [];
        hodlers.forEach(function(hodler) {
          if ($.inArray(hodler, seenHodlers) != -1) {
            return;
          }
          seenHodlers.push(hodler);

          var $address = THDC.utils.linkToAddress(hodler);

          Club.getHodlerInfo(hodler, function (err, result) {
            onError(err);
            var info = new HodlerInfo(result);
            var $info = $hodlerInfoTablePrototype.clone();
            $info.find('[c-hodler-info=address]').html($address);
            $info.find('[c-hodler-info=hodling]').html(web3.fromWei(info.hodling.valueOf(), 'ether') + " " + network.units);
            var blockJoined = info.blockJoined.valueOf();
            if (blockJoined > 0) {
              $info.find('[c-hodler-info=blockJoined]').text(blockJoined);
              $info.find('[c-hodler-info=maturityBlock]').text(info.maturityBlock.valueOf());
            } else {
              $info.find('[c-hodler-info=blockJoined]').text('N/A');
              $info.find('[c-hodler-info=maturityBlock]').text('N/A');
            }

            var blocksUntilMature = parseInt(info.maturityBlock.sub(blockTime.blockNumber).valueOf());
            blocksUntilMature = blocksUntilMature > 0 ? blocksUntilMature : 0;
            if (blockJoined == 0) {
              $info.find('[c-hodler-info=setMature]').text('Member has left club');
            } else if (info.isMature) {
              $info.find('[c-hodler-info=setMature]').text("Mature");
            } else if (blocksUntilMature == 0 && !info.isMature) {
              var $setMature = $("<button>", {text: "Click to Set Mature!"});
              $setMature.on('click', function() {
                console.log('h', hodler);
                Club.setMature(hodler, {gasPrice: cGasPrice}, function(err, tx) {
                  onError(err);
                  showTxModal(tx);
                  $info.find('[c-hodler-info=setMature]').text("Setting Mature");
                });
              });
              $info.find('[c-hodler-info=setMature]').html($setMature);
            } else {
              $info.find('[c-hodler-info=setMature]').text(blocksUntilMature + " blocks until eligible for maturity");
            }

            var $trs = $list.find("tr");
            var inserted = false;
            if ($trs.length == 0) {
              $list.append($info);
              inserted = true;
            }
            if (!inserted) {
              $trs.each(function () {
                if (inserted) {
                  return;
                }
                var $tr = $(this);
                var cur = $tr.find('[c-hodler-info=blockJoined]').text();
                if (cur < blockJoined) {
                  console.log('insert', cur, blockJoined);
                  $tr.before($info);
                  inserted = true;
                }
              });
            }
            if (!inserted) {
              $list.append($info);
            }
          });
        });
      }
    }); // end getHodlers

    /** Club Status **/
    Club.getStatus(function (err, result) {
      onError(err);
      var status = new ClubStatus(result);

      $('[c-club-info=minPrice]').text(parseFloat(status.minPrice) / 100.0 + " USD");
      $('[c-club-info=minBuyIn]').html(web3.fromWei(status.minBuyIn, 'ether') + " " + network.units);
      $('[c-club-info=penaltyPercentage]').text((status.penaltyPercentage / 10) + "%");
      $('[c-club-info=blocksUntilMaturity]').text((status.blocksUntilMaturity));
      $('[c-club-info=founded]').text(status.founded);
      $('[c-club-info=priceHasBeenReached]').text(status.priceHasBeenReached);
      $('[c-club-info=lighthouse]').html(THDC.utils.linkToAddress(status.lighthouse));
      $('[c-club-info=adminPool]').html(web3.fromWei(status.adminPool, 'ether') + " " + network.units);
      $('[c-club-info=hodlersPool]').html(web3.fromWei(status.hodlersPool, 'ether') + " " + network.units);
      $('[c-club-info=numberOfMatureHodlers]').text(status.numberOfMatureHodlers);
      $('[c-club-info=isDisbanded]').text(status.isDisbanded);
      $('[c-club-info=numberOfVotesToDisband]').text(status.numberOfVotesToDisband);
      $('[c-club-info=admin]').html(THDC.utils.linkToAddress(status.admin));

      $('body').on('click', '[c-join-club]', function (evt) {
        evt.preventDefault();
        Club.joinClub({value: status.minBuyIn, gasPrice: cGasPrice}, function (err, tx) {
          onError(err);
          showTxModal(tx);
        });
      });

      Lighthouse = contract.at(status.lighthouse);
      Lighthouse.getPriceAndWhen(function(err, result) {
        onError(err);
        var lighthousePriceInfo = new LighthousePriceInfo(result);
        $('[c-lighthouse-info=price]').text(lighthousePriceInfo.priceInUsd);
        var $a = $("<a>", {
          text: lighthousePriceInfo.lastPriceUpdateBlockNumber,
          href: network.explorerBlock + lighthousePriceInfo.lastPriceUpdateBlockNumber,
          target: '_blank'
        });
        $('[c-lighthouse-info=lastPriceUpdateBlockNumber]').text('block ');
        $('[c-lighthouse-info=lastPriceUpdateBlockNumber]').append($a);
      });
    }); // end getStatus


    /** *********************************************** **/
    /** Action Buttons **/

    $('body').on('click', '[c-hodl-more]', function() {
      $('#hodlMoreModal').vModal('show');
    });

    $('body').on('click', '[c-hodl-more-button]', function() {
      var $form = $("[c-hodl-more-form]");
      var numCoins = $form.find("[name=numCoins]").val();
      $('#hodlMoreModal').vModal('hide');

      Club.joinClub({value: web3.toWei(numCoins, 'ether'), gasPrice: cGasPrice}, function(err, tx) {
        onError(err);
        showTxModal(tx);
      });
    });

    $('body').on('click', '[c-leave-club]', function() {
      $('[name=confirmLeave]').prop('checked', false);
      $('#leaveClubModal').vModal('show');
    });

    $('body').on('click', '[c-leave-club-button]', function() {
      var checked = $('[name=confirmLeave]').prop('checked');

      if (!checked) {
        alert("You must confirm you have read the above");
        return;
      }

      $('#leaveClubModal').vModal('hide');
      Club.leaveClub({gasPrice: cGasPrice}, function(err, tx) {
        onError(err);
        showTxModal(tx);
      });
    });

    $('body').on('click', '[c-query-lighthouse]', function() {
      Club.queryLighthouse({gasPrice: cGasPrice}, function(err, tx) {
        onError(err);
        showTxModal(tx);
      });
    });

    $('body').on('click', '[c-vote-to-disband]', function() {
      $('#disbandModal').vModal('show');
    });
    $('body').on('click', '[c-disband-button]', function() {
      var disband = "true" == $('[name=disband]:checked').val();

      Club.voteToDisband(disband, {gasPrice: cGasPrice}, function(err, tx) {
        onError(err)
        showTxModal(tx);
      });
      $('#disbandModal').vModal('hide');
    });




  }); // end bind on first block
}); // end document ready