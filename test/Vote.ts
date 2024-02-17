// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

// describe("Vote", () => {
//   async function deploy() {
//     const totalSupply = ethers.parseEther("100");
//     const priceToken = ethers.parseEther("1");
//     const [owner, otherAccount] = await ethers.getSigners();
//     const Vote = await ethers.deployContract("Vote", [totalSupply, priceToken]);
//     return { totalSupply, priceToken, owner, otherAccount, Vote };
//   }
//   describe("Testing voteFor function", () => {
//     it("Should upgrade the vote", async () => {
//       const { owner, Vote } = await loadFixture(deploy);

//       await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("5"), {
//         value: ethers.parseEther("5"),
//       });

//       await Vote.connect(owner).closingTokenSale();

//       await Vote.connect(owner).makeProposal("Hello");

//       const proposal1 = await Vote.allProposal(0);

//       await Vote.voteFor(proposal1.id);

//       expect((await Vote.allProposal(0)).forVotes).to.equal(1);
//     });
//   });
// });
