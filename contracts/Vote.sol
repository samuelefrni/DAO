// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./Proposal.sol";

contract Vote is Proposal {
    event voteForCreated(uint proposalId, address memberDAO);
    event voteAgainstCreated(uint proposalId, address memberDAO);
    event votedForAbstain(address memberDAO);

    constructor(
        uint _totalSupply,
        uint _price
    ) Proposal(_totalSupply, _price) {}

    modifier prerequisitesVote() {
        require(sales == 0, "The sales must be closed to vote");
        require(proposal == 0, "The proposal must be closed to vote");
        require(vote == 1, "The vote must be open to vote");
        if (balanceOf(msg.sender) < 1 ether) {
            _isDAOMember[msg.sender] = false;
        }
        require(_isDAOMember[msg.sender], "You cannot vote");
        _;
    }

    function voteFor(uint _proposalId) external prerequisitesVote() {
        bool proposalFound = false;

        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].id == _proposalId) {
                allProposal[i].forVotes++;
                proposalFound = true;
            }
        }

        require(proposalFound == true, "The proposal id was not found");

        _transfer(msg.sender, _contractAddress, 1000000000000000000);

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

    function voteAgainst(uint _proposalId) external prerequisitesVote() {
        bool proposalFound = false;

        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].id == _proposalId) {
                allProposal[i].againstVotes++;
                proposalFound = true;
            }
        }

        require(proposalFound == true, "The proposal id was not found");

        _transfer(msg.sender, _contractAddress, 1000000000000000000);

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

    function abstain() external prerequisitesVote() {
        for (uint i = 0; i < _allDAOMember.length; i++) {
            if (
                _allDAOMember[i].memberAddress == msg.sender &&
                _allDAOMember[i].voted == false
            ) {
                _allDAOMember[i].voted = true;
            }
        }
        emit votedForAbstain(msg.sender);
    }

    function closeVote() external {
        require(vote != 0, "Vote are already closed");
        require(block.timestamp > voteDeadline, "Voting will close 7 day from the first closeProposal call");
        for (uint i = 0; i < _allDAOMember.length; i++) {
            if (!_allDAOMember[i].voted) {
                    _transfer(
                        _allDAOMember[i].memberAddress,
                        _contractAddress,
                        _allDAOMember[i].balance
                    );
                    removeDAOMember(_allDAOMember[i].memberAddress);
            }
        }
        vote = 0;
        executive = 1;
    }
}
