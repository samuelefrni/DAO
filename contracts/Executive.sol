// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./Vote.sol";

contract Executive is Vote {
    uint[] public executedProposal;

    constructor(uint _totalSupply, uint _price) Vote(_totalSupply, _price) {}

    function executeProposal(uint _proposalId) external {
        require(
            executive == 1,
            "To execute a proposal the vote must be closed"
        );

        uint totalVotes = 0;
        uint totalForVotes = 0;
        uint totalAgainstVotes = 0;

        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].id == _proposalId) {
                totalForVotes = allProposal[i].forVotes;
                totalAgainstVotes = allProposal[i].againstVotes;
                totalVotes = totalForVotes + totalAgainstVotes;
            }
        }

        require(totalVotes > 0, "Proposal not found");

        uint percentageFor = (totalForVotes * 100) / totalVotes;

        if (percentageFor < 50) {
            for (uint i = 0; i < allProposal.length; i++) {
                require(
                    !allProposal[i].executed,
                    "Proposal are already executed"
                );
                if (allProposal[i].id == _proposalId) {
                    allProposal[i].executed = true;
                    allProposal[i].approved = "rejected";
                }
            }
        }

        require(
            percentageFor >= 50,
            "Rejected, votes in favor are less than 50%"
        );

        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].id == _proposalId) {
                require(
                    !allProposal[i].executed,
                    "Proposal are already executed"
                );
                allProposal[i].executed = true;
                allProposal[i].approved = "approved";
                executedProposal.push(allProposal[i].id);
                break;
            }
        }
    }

    function closeExecutive() external onlyOwner {
        require(executive != 0, "Executive are already closed");
        bool allProposalExecuted = true;
        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].executed == false) {
                allProposalExecuted = false;
            }
        }
        require(
            allProposalExecuted == true,
            "Before closing the executive all proposal must be executed"
        );
        executive = 0;
    }
}
