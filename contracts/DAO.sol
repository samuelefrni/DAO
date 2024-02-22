// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./Executive.sol";

contract DAO is Executive {
    constructor(uint _totalSupply, uint _price) Executive(_totalSupply, _price){}
}