# TheHodlers.club


### Welcome To the Hodlers Club

Where Mature Hodlers get Cowards Coins

A hodlers club is a smart contract (DApp) which lets you lock up your
<span c-network-units=""></span> until a target price in USD is reached.
The Dapp is designed for anyone who wishes to avoid impulse selling
because of FUD. "Cowards" who leave the club before the price is
reached, leave behind a small percentage of their <span
c-network-units=""></span> which is shared amongst the "Mature Hodlers"
(e.g. hodlers who have waited for the target price to be reached). So by
joining the club, you can hodl your coins until they Moon and maybe get
a few extra coins if Cowards leave.

### How it Works

First someone will create a new hodlers club contract. A club will have
a **target price** in USD, a **minimum buy in** in <span
c-network-units=""></span>, **penalty percentage** for how much <span
c-network-units=""></span> is left behind by Cowards and the **number of
blocks until maturity**.

There is or will be many hodlers clubs on this site all marked for
different target prices, penalties, etc...

Other people will join the club by sending the **minimum buy in** to
become new members. New members are called "Immature Hodlers." Each
Immature Hodler has to wait at least the **number of blocks until
maturity** to then mark themselves as mature by clicking the "Mark as
Mature" button. In fact anyone can mark anyone else as mature after the
right number of blocks and its nice if club members help each other in
this way.

Note: Club member can always add more coins to their initial hodlings
and there is no fee to join a club.

Any member who leaves the club before the target price is reached is a
**Coward** and leaves behind **penalty percentage** of their hodlings to
be shared between the **Mature Hodlers** and the **Admin**.

Once the target is reached, everyone still in the club is a "Hodler" and
will be able to withdraw all of the coins they put into the contract
without penalty. Those that are marked mature will also share any coins
left by **Coward**s.

# Developing

## Node 

Here are the version info

    node --version
    v8.6.0
    npm --version
    5.5.1
    nvm --version
    0.33.0

## http-server

Install `http-server`

    npm install http-server -g

Run

    http-server -c-1 html 

## testrpc 

Command for testrpc

    testrpc -g 10000000000

## truffle

Run with

    truffle test

## web3j command line tools

[web3j](https://github.com/web3j/web3j/releases) releases have command
line tools needed to create the Contract Java classes.

    truffle compile
    truffle deploy # to testrpc
    web3j truffle generate build/contracts/PriceInUsdLighthouse.json \ 
        -o web3-lighthouse-keeper/src/main/java/ \
        -p web3.lighthouse.keeper.sol \

