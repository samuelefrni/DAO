// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./GovernanceToken.sol";

contract Proposal is GovernanceToken {
    uint public voteDeadline;

    struct sProposal {
        uint id;
        address memberAddress;
        string proposal;
        uint forVotes;
        uint againstVotes;
        bool executed;
        string status;
    }

    sProposal[] public allProposal;

    event ProposalCreated(uint id, address memberDAO, string proposal);
    event voteDeadlineCreated(uint blockTimeSpamp);

    constructor(
        uint _totalSupply,
        uint _price
    ) GovernanceToken(_totalSupply, _price) {}

    function makeProposal(string memory _proposal) external {
        require(sales == 0, "The sales must be closed to make a proposal");
        require(proposal == 1, "The proposal are closed");
        if (balanceOf(msg.sender) < 1 ether) {
            _isDAOMember[msg.sender] = false;
        }
        require(
            _isDAOMember[msg.sender],
            "You cannot create proposals if you are not a DAO member"
        );

        _transfer(msg.sender, _contractAddress, 5000000000000000000);

        uint proposalId = uint(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % 1000000;

        allProposal.push(
            sProposal({
                id: proposalId,
                memberAddress: msg.sender,
                proposal: _proposal,
                forVotes: 0,
                againstVotes: 0,
                executed: false,
                status: "pending"
            })
        );

        for (uint i = 0; i < _allDAOMember.length; i++) {
            if (_allDAOMember[i].memberAddress == msg.sender) {
                _allDAOMember[i].voted = true;
            }
        }

        emit ProposalCreated(proposalId, msg.sender, _proposal);
    }

    function searchProposal(
        uint _proposalId
    ) external view returns (sProposal memory) {
        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].id == _proposalId) {
                return allProposal[i];
            }
        }
        revert("Proposal not found");
    }

    function closeProposal() external onlyOwner {
        require(proposal != 0, "Proposal are already closed");
        voteDeadline = block.timestamp + 7 days;
        proposal = 0;
        vote = 1;
        emit voteDeadlineCreated(voteDeadline);
    }
}
