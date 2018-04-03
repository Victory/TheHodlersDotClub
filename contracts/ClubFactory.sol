pragma solidity 0.4.15;

import './TheHodlersDotClub.sol';

contract ClubFactory {
    address[] clubs;
    address admin;

    event ClubCreated(address _founder, address _admin, address _club);

    function ClubFactory()
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

}
