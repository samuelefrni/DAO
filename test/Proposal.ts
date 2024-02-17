// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

// describe("Proposal", () => {
//   async function deploy() {
//     const totalSupply = ethers.parseEther("100");
//     const priceToken = ethers.parseEther("1");
//     const [owner, otherAccount] = await ethers.getSigners();
//     const Proposal = await ethers.deployContract("Proposal", [
//       totalSupply,
//       priceToken,
//     ]);
//     return { totalSupply, priceToken, owner, otherAccount, Proposal };
//   }
//   describe("Testing isDAOMember function", () => {
//     it("Should initialy revert and after the purchase of (at least) 1 GovernanceToken switch to true", async () => {
//       const { otherAccount, Proposal } = await loadFixture(deploy);

//       await expect(
//         Proposal.connect(otherAccount).isDAOMember()
//       ).to.revertedWith("To be a DAO member you should have at least 1 GT");

//       await Proposal.connect(otherAccount).buyGovernanceToken(
//         ethers.parseEther("2"),
//         { value: ethers.parseEther("2") }
//       );

//       expect(await Proposal.connect(otherAccount).isDAOMember()).to.equal(true);
//     });
//   });
//   describe("Testing makeProposal function", () => {
//     it("Should revert because the sales are open", async () => {
//       const { Proposal } = await loadFixture(deploy);

//       await expect(Proposal.makeProposal("")).to.revertedWith(
//         "The sales must be closed to make a proposal"
//       );
//     });
//     it("Should revert because the sale are closed but im not a DAO member", async () => {
//       const { owner, Proposal } = await loadFixture(deploy);

//       await Proposal.connect(owner).closingTokenSale();

//       await expect(Proposal.makeProposal("")).to.revertedWith(
//         "You cannot create proposals if you are not a DAO member"
//       );
//     });
//     it("Should make the proposal and save in the array all proposal", async () => {
//       const { owner, Proposal } = await loadFixture(deploy);

//       await Proposal.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
//         value: ethers.parseEther("2"),
//       });

//       await Proposal.connect(owner).closingTokenSale();

//       await Proposal.connect(owner).makeProposal("Hello World");

//       const firstProposal = await Proposal.allProposal(0);

//       expect((await Proposal.allProposal(0)).id).to.equal(firstProposal.id);
//       expect((await Proposal.allProposal(0)).proposal).to.equal("Hello World");
//     });
//     it("Should change the balance of the user after it make the proposal", async () => {
//       const { owner, Proposal } = await loadFixture(deploy);

//       await Proposal.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
//         value: ethers.parseEther("2"),
//       });

//       await Proposal.connect(owner).closingTokenSale();

//       await Proposal.connect(owner).makeProposal("Hello World");

//       expect(await Proposal.balanceOf(owner)).to.equal(ethers.parseEther("1"));
//     });
//   });
// });
