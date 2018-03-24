pragma solidity 0.4.15;

//import './PriceInUsdLighthouse.sol';

contract Lighthouse {
    function getPrice() public constant returns (uint);
}

contract TheHodlersDotClub {
    struct Member {
        uint blockJoined;
        uint maturityBlock;
        uint hodling;
    }

    address founder;
    uint minPrice;
    uint minBuyIn;
    uint penaltyPercentage;
    uint blocksUntilMaturity;
    bool founded = false;

    address lighthouse;
    uint curPriceInUsdCents;

    mapping(address => Member) members;

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

    event ClubInitialized(address _founder, uint _minPrice, uint _minBuyIn, uint _penaltyPercentage, uint _blocksUntilMaturity, address _lighthouse);
    event NewMember(address _member, uint _hodling, uint _maturityBlock);
    event HolderLevelIncreased(address _member, uint _increase, uint _hodling);
    event NewPriceFromLighthouse(address _inquirer, uint _priceInUsdCents);

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
        founder = msg.sender;
        minPrice = _minPrice;
        minBuyIn = _minBuyIn;
        penaltyPercentage = _penaltyPercentage;
        blocksUntilMaturity = _blocksUntilMaturity;
        lighthouse = _lighthouse;
        founded = true;

        ClubInitialized(msg.sender, minPrice, minBuyIn, penaltyPercentage, blocksUntilMaturity, lighthouse);

        joinClub();
    }

    function joinClub()
    public
    payable
    onlyIfFounded()
    {
        // if not a new player, just update holdings
        if (members[msg.sender].blockJoined != 0) {
            members[msg.sender].hodling += msg.value;
            HolderLevelIncreased(msg.sender, msg.value, members[msg.sender].hodling);
            return;
        }

        require(msg.value >= minBuyIn);

        members[msg.sender] = Member({
            blockJoined: block.number,
            maturityBlock: block.number + blocksUntilMaturity,
            hodling: msg.value});

        NewMember(msg.sender, members[msg.sender].hodling, members[msg.sender].maturityBlock);
    }

    function queryLighthouse()
    public
    {
        Lighthouse lh = Lighthouse(lighthouse);
        curPriceInUsdCents = lh.getPrice();
        NewPriceFromLighthouse(msg.sender, curPriceInUsdCents);
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
        address _lighthouse)
    {
        _minPrice = minPrice;
        _minBuyIn = minBuyIn;
        _penaltyPercentage = penaltyPercentage;
        _blocksUntilMaturity = blocksUntilMaturity;
        _founded = founded;
        _lighthouse = lighthouse;
    }
}
