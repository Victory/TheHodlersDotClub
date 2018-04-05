var network = {
  longName: 'Pirl',
  units: 'PIRL',
  net: 'http://wallrpc.pirl.io/',
  number: '3125659152',
  explorerHome: 'https://poseidon.pirl.io/',
  explorerAddr: 'https://poseidon.pirl.io/explorer/address/',
  explorerTx: 'https://poseidon.pirl.io/explorer/transaction/'
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
  });
});

