// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./Proposal.sol";

contract Vote is Proposal {
    event voteForCreated(uint proposalId, address memberDAO);
    event voteAgainstCreated(uint proposalId, address memberDAO);

    constructor(
        uint _totalSupply,
        uint _price
    ) Proposal(_totalSupply, _price) {}

    function voteFor(uint _proposalId) external {
        require(sales == 0, "The sales must be closed to vote");
        require(proposal == 0, "The proposal must be closed to vote");
        require(vote == 1, "The vote must be open to vote");
        if (balanceOf(msg.sender) < 1 ether) {
            _isDAOMember[msg.sender] = false;
        }
        require(
            _isDAOMember[msg.sender],
            "You cannot vote if you are not a DAO member"
        );

        _transfer(msg.sender, _contractAddress, 1000000000000000000);

        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].id == _proposalId) {
                allProposal[i].forVotes++;
            }
        }

        for (uint i = 0; i < _allDAOMember.length; i++) {
            if (
                _allDAOMember[i].memberAddress == msg.sender &&
                _allDAOMember[i].voted == false
            ) {
                _allDAOMember[i].voted = true;
            }
        }

        emit voteForCreated(_proposalId, msg.sender);
    }

    function voteAgainst(uint _proposalId) external {
        require(sales == 0, "The sales must be closed to vote");
        require(proposal == 0, "The proposal must be closed to vote");
        require(vote == 1, "The vote must be open to vote");
        if (balanceOf(msg.sender) < 1 ether) {
            _isDAOMember[msg.sender] = false;
        }
        require(
            _isDAOMember[msg.sender],
            "You cannot vote if you are not a DAO member"
        );

        _transfer(msg.sender, address(this), 1000000000000000000);

        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].id == _proposalId) {
                allProposal[i].againstVotes++;
            }
        }

        for (uint i = 0; i < _allDAOMember.length; i++) {
            if (
                _allDAOMember[i].memberAddress == msg.sender &&
                _allDAOMember[i].voted == false
            ) {
                _allDAOMember[i].voted = true;
            }
        }

        emit voteAgainstCreated(_proposalId, msg.sender);
    }

    function closeVote() external onlyOwner {
        for (uint i = 0; i < _allDAOMember.length; i++) {
            if (!_allDAOMember[i].voted) {
                revert("All DAO member should vote before close vote");
            }
        }
        vote = 0;
        proposal = 1;
    }
}
