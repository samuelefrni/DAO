// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./Vote.sol";

contract Executive is Vote {
    struct sExecutedProposal {
        uint id;
        string status;
    }

    sExecutedProposal[] public executedProposal;

    constructor(uint _totalSupply, uint _price) Vote(_totalSupply, _price) {}

    function executeProposal(uint _proposalId) external {
        require(
            executive == 1,
            "To execute a proposal the vote must be closed"
        );

        uint totalVotes = 0;
        uint totalForVotes = 0;
        uint totalAgainstVotes = 0;

        bool proposalFound = false;
        uint indexProposalExecution;

        for (uint i = 0; i < allProposal.length; i++) {
            if (allProposal[i].id == _proposalId) {
                totalForVotes = allProposal[i].forVotes;
                totalAgainstVotes = allProposal[i].againstVotes;
                totalVotes = totalForVotes + totalAgainstVotes;
                proposalFound = true;
                indexProposalExecution = i;
                break;
            }
        }

        require(proposalFound == true, "Proposal not found");

        uint percentageFor = (totalForVotes * 100) / totalVotes;

        if (percentageFor < 50) {
            require(
                !allProposal[indexProposalExecution].executed,
                "Proposal already executed, check the allProposal array or executedProposal to see the results"
            );
            allProposal[indexProposalExecution].executed = true;
            allProposal[indexProposalExecution].status = "rejected";
            executedProposal.push(
                sExecutedProposal({
                    id: allProposal[indexProposalExecution].id,
                    status: allProposal[indexProposalExecution].status
                })
            );
        } else {
            require(
                !allProposal[indexProposalExecution].executed,
                "Proposal already executed, check the allProposal array or executedProposal to see the results"
            );
            allProposal[indexProposalExecution].executed = true;
            allProposal[indexProposalExecution].status = "approved";
            executedProposal.push(
                sExecutedProposal({
                    id: allProposal[indexProposalExecution].id,
                    status: allProposal[indexProposalExecution].status
                })
            );
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
