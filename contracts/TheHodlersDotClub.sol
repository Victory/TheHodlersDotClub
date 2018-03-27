pragma solidity 0.4.15;

//import './PriceInUsdLighthouse.sol';

contract Lighthouse {
    function getPrice() public constant returns (uint);
}

contract TheHodlersDotClub {
    struct Hodler {
        uint blockJoined;
        uint maturityBlock;
        uint hodling;
        bool isMature;
    }

    address founder;
    uint minPrice;
    uint minBuyIn;
    uint penaltyPercentage;
    uint blocksUntilMaturity;
    bool founded = false;

    address lighthouse;
    uint curPriceInUsdCents;

    address[] hodlerAddresses;

    mapping(address => Hodler) hodlers;
    uint numberOfHodlers = 0;
    uint numberOfMatureHodlers = 0;

    bool priceHasBeenReached = false;
    uint priceReachedBlock = 0;

    // how man coins have been left by cowards going to the hodlers
    uint hodlersPool;
    // how man coins have been left by cowards going to the admin
    uint adminPool;

    function TheHodlersDotClub() {}

    modifier onlyIfNotFounded()
    {
        require(!founded);
        _;
    }

    modifier onlyIfFounded()
    {
        require(founded);
        _;
    }

    modifier onlyIfHodler(address _who)
    {
        require(isHodler(_who));
        _;
    }

    event ClubInitialized(address _founder, uint _minPrice, uint _minBuyIn, uint _penaltyPercentage, uint _blocksUntilMaturity, address _lighthouse);
    event NewHodler(address _hodler, uint _hodling, uint _maturityBlock);
    event HolderLevelIncreased(address _hodler, uint _increase, uint _hodling);
    event NewPriceFromLighthouse(address _inquirer, uint _priceInUsdCents, bool _priceHasBeenReached);

    event HodlerIsNowMature(address _hodler, address _txSender, uint _numberOfMatureHodlers);

    event CowardLeftClub(address _coward, uint _sentToAdminPool, uint _sentToHodlersPool, uint _withdrawn);
    event ImmatureHodlerLeftClub(address _hodler, uint _withdrawn);
    event HodlerLeftClub(address _hodler, uint _hodling, uint _bonus);

    function foundClub(
        uint _minPrice,
        uint _minBuyIn,
        uint _penaltyPercentage,
        uint _blocksUntilMaturity,
        address _lighthouse)
    public
    payable
    onlyIfNotFounded()
    {
        require(
            _penaltyPercentage <= 450
            && _penaltyPercentage >= 10
            && _minBuyIn >= 1 ether);

        founder = msg.sender;
        minPrice = _minPrice;
        minBuyIn = _minBuyIn;
        penaltyPercentage = _penaltyPercentage;
        blocksUntilMaturity = _blocksUntilMaturity;
        lighthouse = _lighthouse;
        founded = true;

        queryLighthouse();

        ClubInitialized(msg.sender, minPrice, minBuyIn, penaltyPercentage, blocksUntilMaturity, lighthouse);

        joinClub();
    }

    function joinClub()
    public
    payable
    onlyIfFounded()
    {

        // round off the last 100000 wei (generally this will be zero)
        uint roundOff = msg.value % 100000;
        require(msg.value > roundOff);
        uint hodling  = msg.value - roundOff;
        adminPool += roundOff;

        // if not a new player, just update hodlings
        if (isHodler(msg.sender)) {
            hodlers[msg.sender].hodling += msg.value;
            HolderLevelIncreased(msg.sender, msg.value, hodlers[msg.sender].hodling);
            return;
        }

        require(msg.value >= minBuyIn);

        hodlerAddresses.push(msg.sender);
        numberOfHodlers += 1;

        hodlers[msg.sender] = Hodler({
            blockJoined: block.number,
            maturityBlock: block.number + blocksUntilMaturity,
            hodling: hodling,
            isMature: false});

        NewHodler(msg.sender, hodlers[msg.sender].hodling, hodlers[msg.sender].maturityBlock);
    }

    function leaveClub()
    public
    onlyIfHodler(msg.sender)
    {
        // last chance to mark mature
        setMature(msg.sender);

        uint hodling = hodlers[msg.sender].hodling;
        hodlers[msg.sender].hodling = 0;
        hodlers[msg.sender].blockJoined = 0;
        numberOfHodlers -= 1;

        // a cowards exit
        if (!priceHasBeenReached) {
            // 5% to the admin
            uint toAdminPool = (hodling * 50) / 1000;
            adminPool += toAdminPool;
            // penalty % to the hodlers
            uint toHodlersPool = (hodling * penaltyPercentage) / 1000;
            hodlersPool += toHodlersPool;
            hodling = hodling - toAdminPool - toHodlersPool;
            msg.sender.transfer(hodling);
            CowardLeftClub(msg.sender, toAdminPool, toHodlersPool, hodling);
            return;
        }

        // immature hodler, no penalty no bonus
        if (!hodlers[msg.sender].isMature) {
            msg.sender.transfer(hodling);
            ImmatureHodlerLeftClub(msg.sender, hodling);
            return;
        }

        uint bonus = hodlersPool * (1 / (numberOfMatureHodlers));
        hodlersPool -= bonus;
        uint toSend = hodling + bonus;
        msg.sender.transfer(toSend);
        HodlerLeftClub(msg.sender, numberOfHodlers, hodlersPool);
    }

    function queryLighthouse()
    public
    {
        Lighthouse lh = Lighthouse(lighthouse);
        curPriceInUsdCents = lh.getPrice();

        if (curPriceInUsdCents >= minPrice) {
            priceHasBeenReached = true;
            priceReachedBlock = block.number;
        }

        NewPriceFromLighthouse(msg.sender, curPriceInUsdCents, priceHasBeenReached);
    }

    function setMature(address _hodler)
    public
    onlyIfHodler(_hodler)
    {
        if (hodlers[_hodler].isMature) {
            return;
        }

        bool isMature = (priceHasBeenReached) ?
            hodlers[_hodler].maturityBlock < priceReachedBlock :
            hodlers[_hodler].maturityBlock < block.number;

        if (isMature) {
            hodlers[_hodler].isMature = isMature;
            numberOfMatureHodlers += 1;
            HodlerIsNowMature(_hodler, msg.sender, numberOfMatureHodlers);
        }
    }

    function setSenderMature()
    public
    {
        setMature(msg.sender);
    }

    function getHodlers()
    public
    constant
    returns (address[])
    {
        return hodlerAddresses;
    }

    function getHodlerInfo(address _hodler)
    public
    constant
    returns(
        uint _blockJoined,
        uint _maturityBlock,
        uint _hodling,
        bool _isMature
    )
    {
        Hodler memory hodler = hodlers[_hodler];
        _blockJoined = hodler.blockJoined;
        _maturityBlock = hodler.maturityBlock;
        _hodling = hodler.hodling;
        _isMature = hodler.isMature;
    }

    function isHodler(address _who)
    public
    constant
    returns (bool) {
        return hodlers[_who].blockJoined != 0;
    }

    function getStatus()
    public
    constant
    returns (
        uint _minPrice,
        uint _minBuyIn,
        uint _penaltyPercentage,
        uint _blocksUntilMaturity,
        bool _founded,
        bool _priceHasBeenReached,
        address _lighthouse,
        uint _adminPool,
        uint _hodlersPool,
        uint _numberOfMatureHodlers
    )
    {
        _minPrice = minPrice;
        _minBuyIn = minBuyIn;
        _penaltyPercentage = penaltyPercentage;
        _blocksUntilMaturity = blocksUntilMaturity;
        _founded = founded;
        _priceHasBeenReached = priceHasBeenReached;
        _lighthouse = lighthouse;
        _adminPool = adminPool;
        _hodlersPool = hodlersPool;
        _numberOfMatureHodlers = numberOfMatureHodlers;
    }
}
