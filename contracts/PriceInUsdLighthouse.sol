pragma solidity 0.4.15;


contract PriceInUsdLighthouse {

    uint donations;

    // keepers can set price
    mapping(address => bool) keepers;
    mapping(address => address) keepersChain;
    address keepersChainTail;
    uint numberOfKeepers;
    uint maxKeepers;

    // custodians can remove keepers
    mapping(address => bool) custodians;
    // owner can add and remove custodians
    address owner;

    uint minBlocksBetweenPriceUpdate;

    uint priceInUsdCents;
    uint lastPriceUpdateBlockNumber;
    address lastPriceSetBy;

    event NewKeeper(address _sender, address _newKeeper);
    event KeeperRemoved(address _sender, address _removedKeeper, address _position);
    event PriceUpdated(address _sender, address _lastPriceSetBy, uint _priceInUsd);

    event ErrorPriceUpdatedTooSoon(address _sender, address _lastPriceSetBy, uint _priceInUsd, uint _nextValidBlockToUpdatePrice);
    event ErrorAlreadyAKeeper(address _sender, address _newKeeper);
    event ErrorTooManyKeepers(address _sender);

    function PriceInUsdLighthouse()
    {

        owner = msg.sender;

        numberOfKeepers = 0;
        maxKeepers = 5;

        priceInUsdCents = 0;
        minBlocksBetweenPriceUpdate = 100;
        lastPriceUpdateBlockNumber = 0;

        donations = 0;

        keepersChainTail = owner;
        addKeeper(owner);
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

    function addCustodians(address _newCustodian)
    public
    onlyBy(owner)
    {
        keepers[_newCustodian] = true;
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
            ErrorTooManyKeepers(msg.sender);
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
            cur = keepersChain[cur];
            if (cur == address(0)) {
                return keepersChain[cur];
            }
        }
        require(false);
    }

    function removeKeeper(address _keeperToRemove)
    public
    onlyIfCustodian()
    {
        require(numberOfKeepers > 1);

        keepers[_keeperToRemove] = false;

        address prev = keepersChainTail;
        if (_keeperToRemove == keepersChainTail) {
            keepersChainTail = keepersChain[prev];

            KeeperRemoved(msg.sender, _keeperToRemove, 0);
            return;
        }

        address cur = keepersChain[prev];
        for (uint ii = 0; ii < maxKeepers; ii++) {
            if (cur == _keeperToRemove) {
                keepersChain[prev] = keepersChain[cur];
                keepersChain[cur] = address(0);
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
        if (block.number > lastPriceUpdateBlockNumber + minBlocksBetweenPriceUpdate) {
            priceInUsdCents = _priceInUsdCents;
            lastPriceUpdateBlockNumber = block.number;
            lastPriceSetBy = msg.sender;
            PriceUpdated(msg.sender, lastPriceSetBy, priceInUsdCents);
        } else {
            ErrorPriceUpdatedTooSoon(
                msg.sender, lastPriceSetBy, priceInUsdCents, lastPriceUpdateBlockNumber + minBlocksBetweenPriceUpdate);
        }
    }

    function getPrice()
    public
    constant
    returns (uint)
    {
        return priceInUsdCents;
    }

    function getState()
    public
    constant
    returns (
        uint _priceInUsd,
        uint _lastPriceUpdateBlockNumber,
        address _lastPriceSetBy,
        uint _nextValidBlockToUpdatePrice)
    {
        _priceInUsd = priceInUsdCents;
        _lastPriceUpdateBlockNumber = lastPriceUpdateBlockNumber;
        _lastPriceSetBy = lastPriceSetBy;
        _nextValidBlockToUpdatePrice = lastPriceUpdateBlockNumber + minBlocksBetweenPriceUpdate;
    }

    function withdraw()
    public
    onlyIfKeeper()
    {
        address cur = keepersChainTail;
        for (uint ii = 0; ii < maxKeepers; ii++) {
            cur.transfer(donations / numberOfKeepers);
            cur = keepersChain[cur];
            if (cur == address(0)) {
                return;
            }
        }
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

    // Donations to keep the lighthouse running
    function()
    payable
    public
    {
        donations += msg.value;
    }
}
