pragma solidity 0.4.15;

import './TheHodlersDotClub.sol';

contract TheHodlersDotClubFactory {
    address[] clubs;
    address[] founders;

    // founder => created clubs
    mapping(address => address[]) founderToCreatedClubs;

    address admin;

    event ClubCreated(address _founder, address _admin, address _club);

    function TheHodlersDotClubFactory()
    public
    {
        admin = msg.sender;
    }

    function createClub()
    public
    returns (TheHodlersDotClub _club)
    {
        _club = new TheHodlersDotClub();
        _club.newAdmin(admin);

        clubs.push(_club);
        if (founderToCreatedClubs[msg.sender].length == 0) {
            founders.push(msg.sender);
        }
        founderToCreatedClubs[msg.sender].push(_club);

        ClubCreated(msg.sender, admin, _club);
    }

    function newAdmin(address _newAdmin)
    {
        require(msg.sender == admin);
        admin = _newAdmin;
    }

    function getAdmin()
    public
    constant
    returns(address _admin)
    {
        _admin = admin;
    }

    function getClubs()
    public
    constant
    returns (address[])
    {
        return clubs;
    }

    function getFounders()
    public
    constant
    returns (address[])
    {
        return founders;
    }

    function getFoundersClubs(address _founder)
    public
    constant
    returns (address[])
    {
        return founderToCreatedClubs[_founder];
    }
}
