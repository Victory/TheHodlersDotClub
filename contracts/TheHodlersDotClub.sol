pragma solidity 0.4.15;

import './PriceInUsdLighthouse.sol';


contract TheHodlersDotClub {
    struct Hodler {
        uint blockJoined;
        uint maturityBlock;
        uint hodling;
        bool isMature;
    }

    address admin;

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

    mapping(address => bool) disbandVotes;
    uint numberOfVotesToDisband;
    bool isDisbanded;

    // how man coins have been left by cowards going to the hodlers
    uint hodlersPool;
    // how man coins have been left by cowards going to the admin
    uint adminPool;

    function TheHodlersDotClub() {
        admin = msg.sender;
    }

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

    event VoteToDisband(address _hodler, bool _votedToDisband, uint _numberOfVotesToDisband, uint _numberNeededToDisband, bool _isDisbanded);

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
            && _minBuyIn >= 1 ether
            && msg.value >= _minBuyIn);

        founder = msg.sender;
        minPrice = _minPrice;
        minBuyIn = _minBuyIn;
        penaltyPercentage = _penaltyPercentage;
        blocksUntilMaturity = _blocksUntilMaturity;
        lighthouse = _lighthouse;
        founded = true;

        ClubInitialized(msg.sender, minPrice, minBuyIn, penaltyPercentage, blocksUntilMaturity, lighthouse);

        queryLighthouse();

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
        bool isMature = hodlers[msg.sender].isMature;
        hodlers[msg.sender].hodling = 0;
        hodlers[msg.sender].blockJoined = 0;
        hodlers[msg.sender].isMature = false;
        numberOfHodlers -= 1;

        if (isDisbanded) {
            msg.sender.transfer(hodling);
            HodlerLeftClub(msg.sender, hodling, 0);
            return;
        }

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
        if (!isMature) {
            msg.sender.transfer(hodling);
            ImmatureHodlerLeftClub(msg.sender, hodling);
            return;
        }

        uint bonus = hodlersPool / numberOfMatureHodlers;
        uint toSend = hodling + bonus;
        msg.sender.transfer(toSend);
        HodlerLeftClub(msg.sender, hodling, bonus);
    }

    function queryLighthouse()
    public
    {
        PriceInUsdLighthouse lh = PriceInUsdLighthouse(lighthouse);
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

    function voteToDisband(bool _votedToDisband)
    public
    {
        if (isDisbanded || disbandVotes[msg.sender] == _votedToDisband) {
            return;
        }

        require(msg.sender == founder || hodlers[msg.sender].isMature);

        uint numberNeededToDisband = numberOfHodlers / 2;

        if (_votedToDisband) {
            numberOfVotesToDisband += 1;
        } else if (!_votedToDisband && numberOfVotesToDisband > 0) {
            numberOfVotesToDisband -= 1;
        }

        isDisbanded = numberNeededToDisband <= numberOfVotesToDisband;
        disbandVotes[msg.sender] = _votedToDisband;
        if (isDisbanded) {
            adminPool += hodlersPool;
            hodlersPool = 0;
        }

        VoteToDisband(msg.sender, _votedToDisband, numberOfVotesToDisband, numberNeededToDisband, isDisbanded);
    }

    function newAdmin(address _newAdmin)
    public
    {
        require(admin == msg.sender);
        admin = _newAdmin;
    }

    function adminWithdraw()
    public
    {
        require(admin == msg.sender);
        uint toSend = adminPool;
        adminPool = 0;
        admin.transfer(toSend);
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
        uint _numberOfMatureHodlers,
        bool _isDisbanded,
        uint _numberOfVotesToDisband,
        address _admin
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
        _isDisbanded = isDisbanded;
        _numberOfVotesToDisband = numberOfVotesToDisband;
        _admin = admin;

    }
}
