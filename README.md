# TheHodlers.club


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

