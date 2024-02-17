// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GovernanceToken is ERC20 {
    struct sDAOMemberInfo {
        address memberAddress;
        uint balance;
        bool voted;
    }

    address public _owner;
    uint private _tokenPrice;
    address internal _contractAddress = address(this);

    mapping(address => bool) public _isDAOMember;
    sDAOMemberInfo[] public _allDAOMember;

    // 0 => Close 1 => Open
    uint public sales = 1;
    uint public proposal = 0;
    uint public vote = 0;
    uint public executive = 0;

    constructor(uint _totalSupply, uint _price) ERC20("GovernanceToken", "GT") {
        _mint(address(this), _totalSupply);
        _tokenPrice = _price;
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only Owner can call this function");
        _;
    }

    function price() external view returns (uint) {
        return _tokenPrice;
    }

    function buyGovernanceToken(uint _amount) external payable {
        require(sales == 1, "Sales of the token are close");
        require(_amount >= 1 ether, "The minimum spend is 1 ether");

        uint valueInEther = _amount / 1 ether;
        uint totalAmount = valueInEther * _tokenPrice;

        require(msg.value >= totalAmount, "Insufficient funds");
        require(
            _amount <= 5000000000000000000 &&
                balanceOf(msg.sender) + _amount <= 5000000000000000000,
            "You cant hold more than 5 GovernanceToken"
        );
        require(
            balanceOf(address(this)) >= _amount,
            "The contract does not have this amount"
        );

        uint change = msg.value - totalAmount;

        _transfer(address(this), msg.sender, _amount);

        if (change > 0) {
            payable(msg.sender).transfer(change);
        }

        if (!_isDAOMember[msg.sender]) {
            _isDAOMember[msg.sender] = true;
            _allDAOMember.push(
                sDAOMemberInfo({
                    memberAddress: msg.sender,
                    balance: balanceOf(msg.sender),
                    voted: false
                })
            );
        }
    }

    function isDAOMember() external view returns (bool) {
        require(
            balanceOf(msg.sender) >= 1 ether,
            "To be a DAO member you should have at least 1 GT"
        );
        return _isDAOMember[msg.sender];
    }

    function removeDAOMember(address _sender) internal {
        for (uint i = 0; i < _allDAOMember.length; i++) {
            if (_allDAOMember[i].memberAddress == _sender) {
                delete _allDAOMember[i];
            }
        }
    }

    function closingTokenSale() external onlyOwner {
        require(sales != 0, "Sales are already closed");
        sales = 0;
        proposal = 1;
    }

    function openTokenSale() external onlyOwner {
        require(sales != 1, "Sales are already open");
        require(proposal == 0, "Proposal must be close to open token sale");
        require(vote == 0, "Vote must be close to open token sale");
        require(
            executive == 0,
            "The executive fase must be closed to open the token sales"
        );
        sales = 1;
    }

    receive() external payable {
        revert("This contract does not accept ether directly");
    }
}
