window.blockTime = {
  gasPrice: web3.toWei('3', 'gwei')
};


blockTime.init = function (updateTime) {
  var $blockNumber = $("[blocktime-current-block-number]");
  var $timeSince = $("[blocktime-time-since-last-block]");

  var updateBlockNumber = function() {
    web3.eth.getBlockNumber(function (err, number) {
      if (err) {
        $blockNumber.text("Could not retrieve");
        console.error(err);
        return;
      }

      if (blockTime.blockNumber > number) {
        console.warn("Old block number found expected greater than " + blockTime.blockNumber + " but was " + number);
        return;
      } else if (blockTime.blockNumber === number) {
        return;
      }

      blockTime.blockNumber = number;
      if (blockTime.firstBlockNumber === 0) {
        blockTime.firstBlockNumber = blockTime.blockNumber;

      }

      if (blockTime.firstBlockNumber + blockTime.blocksBeforeReload < blockTime.blockNumber) {
        document.location.reload();
      }

      var now = new Date() / 1000;
      blockTime.lastBlockNumberTime = now;
      blockTime.timeSinceLastBlock = 0;

      console.log('number', number);
      $("body").trigger("blocktime-block-number", {number:web3.toBigNumber(number)});
      $blockNumber.text(number);
    });
  };

  //$("body").one("blocktime-block-number", );

  setTimeout(updateBlockNumber, 1);
  setInterval(updateBlockNumber, updateTime);
  setInterval(function() {
    var now = new Date() / 1000;
    blockTime.timeSinceLastBlock = now - blockTime.lastBlockNumberTime;
    $timeSince.text(blockTime.timeSinceLastBlock.toFixed(1));
  }, 1875);
};

