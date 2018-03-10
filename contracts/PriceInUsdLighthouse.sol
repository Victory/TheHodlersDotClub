pragma solidity 0.4.15;


contract PriceInUsdLighthouse {

    uint public donations;

    // keepers can set price
    mapping(address => bool) keepers;
    mapping(address => address) keepersChain;
    mapping(address => uint) keepersShares;
    address keepersChainTail;
    uint numberOfKeepers;
    uint maxKeepers;

    // custodians can remove keepers
    mapping(address => bool) custodians;
    // owner can add and remove custodians
    address owner;

    uint priceInUsdCents;
    uint lastPriceUpdateBlockNumber;
    address lastPriceSetBy;

    event NewKeeper(address _sender, address _newKeeper);
    event KeeperRemoved(address _sender, address _removedKeeper);
    event PriceUpdated(address _sender, uint _priceInUsdCents);

    event ErrorPriceUpdatedTooSoon(address _sender, address _lastPriceSetBy, uint _priceInUsdCents);
    event ErrorAlreadyAKeeper(address _sender, address _newKeeper);
    event ErrorTooManyKeepers(address _sender, address _newKeeper);

    function PriceInUsdLighthouse()
    {

        owner = msg.sender;

        numberOfKeepers = 0;
        maxKeepers = 5;

        priceInUsdCents = 0;
        lastPriceUpdateBlockNumber = 0;

        donations = 0;

        keepersChainTail = owner;
        addKeeper(owner);

        addCustodian(owner);
    }

    modifier onlyBy(address _account)
    {
        require(msg.sender == _account);
        _;
    }

    modifier onlyIfKeeper()
    {
        require(keepers[msg.sender]);
        _;
    }

    modifier onlyIfCustodian()
    {
        require(custodians[msg.sender]);
        _;
    }

    function changeOwner(address _newOwner)
    public
    onlyBy(owner)
    {
        owner = _newOwner;
        keepers[_newOwner] = true;
    }

    function addCustodian(address _newCustodian)
    public
    onlyBy(owner)
    {
        custodians[_newCustodian] = true;
    }

    function removeCustodian(address _custodianToRemove)
    public
    onlyBy(owner)
    {
        custodians[_custodianToRemove] = false;
    }

    function addKeeper(address _newKeeper)
    public
    onlyBy(owner)
    {
        if (keepers[_newKeeper]) {
            ErrorAlreadyAKeeper(msg.sender, _newKeeper);
            return;
        }

        if (numberOfKeepers >= maxKeepers) {
            ErrorTooManyKeepers(msg.sender, _newKeeper);
            return;
        }

        keepers[_newKeeper] = true;
        keepersChain[findKeepersChainHead()] = _newKeeper;
        keepersChain[_newKeeper] = address(0);
        numberOfKeepers = numberOfKeepers + 1;
        NewKeeper(msg.sender, _newKeeper);
    }

    function findKeepersChainHead()
    private
    returns (address)
    {
        address cur = keepersChainTail;
        for (uint ii = 0; ii < maxKeepers; ii++) {
            if (keepersChain[cur] != address(0)) {
                cur = keepersChain[cur];
                continue;
            }

            return cur;
        }
        require(false);
    }

    event debug1();
    event debug2(address _cur, address _prev, address _keeperToRemove);

    function removeKeeper(address _keeperToRemove)
    public
    onlyIfCustodian()
    {
        require(numberOfKeepers > 1);

        keepers[_keeperToRemove] = false;

        address prev = keepersChainTail;
        if (_keeperToRemove == keepersChainTail) {
            keepersChainTail = keepersChain[prev];
            numberOfKeepers = numberOfKeepers - 1;
            KeeperRemoved(msg.sender, _keeperToRemove);
            return;
        }

        debug1();

        address cur = keepersChain[prev];
        for (uint ii = 0; ii < maxKeepers; ii++) {
            debug2(cur, prev, _keeperToRemove);
            if (cur == _keeperToRemove) {
                keepersChain[prev] = keepersChain[cur];
                keepersChain[cur] = address(0);
                numberOfKeepers = numberOfKeepers - 1;
                KeeperRemoved(msg.sender, _keeperToRemove);
                return;
            } else {
                prev = cur;
                cur = keepersChain[prev];
            }
        }

        require(false);
    }

    function setPrice(uint _priceInUsdCents)
    public
    onlyIfKeeper()
    {
        priceInUsdCents = _priceInUsdCents;
        lastPriceUpdateBlockNumber = block.number;
        lastPriceSetBy = msg.sender;
        PriceUpdated(msg.sender, priceInUsdCents);
    }

    function getPrice()
    public
    constant
    returns (uint)
    {
        return priceInUsdCents;
    }

    function getPriceAndWhen()
    public
    constant
    returns (
        uint _priceInUsdCents,
        uint _lastPriceUpdateBlockNumber)
    {
        _priceInUsdCents = priceInUsdCents;
        _lastPriceUpdateBlockNumber = lastPriceUpdateBlockNumber;
    }

    function getState()
    public
    constant
    returns (
        uint _priceInUsdCents,
        uint _lastPriceUpdateBlockNumber,
        address _lastPriceSetBy,
        uint _donations)
    {
        _priceInUsdCents = priceInUsdCents;
        _lastPriceUpdateBlockNumber = lastPriceUpdateBlockNumber;
        _lastPriceSetBy = lastPriceSetBy;
        _donations = donations;
    }

    function getKeepers()
    public
    returns (address[] _keepers)
    {
        address[] memory __keepers = new address[](maxKeepers);
        address cur = keepersChainTail;
        for (uint ii = 0; ii < maxKeepers; ii++) {
            __keepers[ii] = cur;
            cur = keepersChain[cur];
            if (cur == address(0)) {
                break;
            }
        }

        _keepers = __keepers;
    }

    function withdraw()
    public
    {
        uint share = keepersShares[msg.sender];
        keepersShares[msg.sender] = 0;
        msg.sender.transfer(share);
    }

    function checkShares()
    public
    returns (uint _shares)
    {
        _shares = keepersShares[msg.sender];
    }

    function splitShares()
    public
    onlyIfKeeper()
    {
        address cur = keepersChainTail;
        uint share;
        uint originalDonations = donations;
        for (uint ii = 0; ii < maxKeepers; ii++) {
            share = originalDonations / numberOfKeepers;
            donations -= share;
            keepersShares[cur] += share;
            cur = keepersChain[cur];
            if (cur == address(0)) {
                return;
            }
        }
    }

    // Donations to keep the lighthouse running
    function()
    payable
    public
    {
        donations += msg.value;
    }
}
