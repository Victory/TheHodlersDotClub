pragma solidity 0.4.15;


contract PriceInUsdLighthouse {

    // keepers can set price
    mapping(address => bool) keepers;
    // custodians can remove keepers
    mapping(address => bool) custodians;
    // owner can add and remove custodians
    address owner;

    uint minBlocksBetweenPriceUpdate;

    uint priceInUsd;
    uint lastPriceUpdateBlockNumber;
    address lastPriceSetBy;

    event PriceUpdated(address _lastPriceSetBy, uint _priceInUsd);
    event ErrorPriceUpdatedTooSoon(address _lastPriceSetBy, uint _priceInUsd, uint _nextValidBlockToUpdatePrice);

    function PriceInUsdLighthouse()
    {
        owner = msg.sender;
        addKeeper(owner);
        priceInUsd = 0;
        minBlocksBetweenPriceUpdate = 100;
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
    onlyBy(owner)
    {
        owner = _newOwner;
        keepers[_newOwner] = true;
    }

    function addCustodians(address _newCustodian)
    onlyBy(owner)
    {
        keepers[_newCustodian] = true;
    }

    function addKeeper(address _newKeeper)
    onlyBy(owner)
    {
        keepers[_newKeeper] = true;
    }

    function removeKeeper(address _keeperToRemove)
    onlyIfCustodian()
    {
        keepers[_keeperToRemove] = false;
    }

    function setPrice(uint _priceInUsd)
    onlyIfKeeper()
    {
        if (block.number > lastPriceUpdateBlockNumber + minBlocksBetweenPriceUpdate) {
            priceInUsd = _priceInUsd;
            lastPriceUpdateBlockNumber = block.number;
            lastPriceSetBy = msg.sender;
            PriceUpdated(lastPriceSetBy, priceInUsd);
        } else {
            ErrorPriceUpdatedTooSoon(
                lastPriceSetBy, priceInUsd, lastPriceUpdateBlockNumber + minBlocksBetweenPriceUpdate);
        }
    }

    function getState()
    returns (
        uint _priceInUsd,
        uint _lastPriceUpdateBlockNumber,
        address _lastPriceSetBy,
        uint _nextValidBlockToUpdatePrice)
    {
        _priceInUsd = priceInUsd;
        _lastPriceUpdateBlockNumber = lastPriceUpdateBlockNumber;
        _lastPriceSetBy = lastPriceSetBy;
        _nextValidBlockToUpdatePrice = lastPriceUpdateBlockNumber + minBlocksBetweenPriceUpdate;
    }

    function()
    payable
    {
       owner.transfer(msg.value);
    }
}
