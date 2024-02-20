import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Proposal", () => {
  async function deploy() {
    const totalSupply = ethers.parseEther("10");
    const priceToken = ethers.parseEther("1");
    const [owner, otherAccount] = await ethers.getSigners();
    const Proposal = await ethers.deployContract("Proposal", [
      totalSupply,
      priceToken,
    ]);
    return { totalSupply, priceToken, owner, otherAccount, Proposal };
  }
  describe("Testing makeProposal function", () => {
    it("Should revert if the sales are open", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await expect(
        Proposal.connect(owner).makeProposal("Hello World")
      ).to.revertedWith("The sales must be closed to make a proposal");
    });
    it("Should close the token sale and open the proposal", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await Proposal.connect(owner).closingTokenSale();

      expect(await Proposal.sales()).to.equal(0);
      expect(await Proposal.proposal()).to.equal(1);
    });
    it("Should revert if the sender that call the makeProposal dont have at least 1 GT", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await Proposal.connect(owner).closingTokenSale();

      await expect(
        Proposal.connect(owner).makeProposal("Hello World")
      ).to.revertedWith(
        "You cannot create proposals if you are not a DAO member"
      );
    });
    it("Should make the proposal and add it to the allProposal array after taking the tokens from the sender", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await Proposal.connect(owner).buyGovernanceToken(ethers.parseEther("5"), {
        value: ethers.parseEther("5"),
      });

      await Proposal.connect(owner).closingTokenSale();

      await Proposal.connect(owner).makeProposal("Hello World");

      expect(await Proposal.balanceOf(owner)).to.equal(ethers.parseEther("0"));
      expect((await Proposal.allProposal(0)).proposal).to.equal("Hello World");
    });
    it("Should make the proposal and after that, change the voted bool to true", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await Proposal.connect(owner).buyGovernanceToken(ethers.parseEther("5"), {
        value: ethers.parseEther("5"),
      });

      await Proposal.connect(owner).closingTokenSale();

      await Proposal.connect(owner).makeProposal("Hello World");

      expect(await Proposal.balanceOf(owner)).to.equal(ethers.parseEther("0"));
      expect((await Proposal.allProposal(0)).proposal).to.equal("Hello World");
      expect((await Proposal._allDAOMember(0)).memberAddress).to.equal(owner);
      expect((await Proposal._allDAOMember(0)).voted).to.equal(true);
    });
  });
  describe("Testing searchProposal function", () => {
    it("Should revert if the proposal Id doesn't not found", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await expect(
        Proposal.connect(owner).searchProposal(28463)
      ).to.revertedWith("Proposal not found");
    });
    it("Should return the allProposal object if the id match the search", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await Proposal.connect(owner).buyGovernanceToken(ethers.parseEther("5"), {
        value: ethers.parseEther("5"),
      });

      await Proposal.connect(owner).closingTokenSale();

      await Proposal.connect(owner).makeProposal("Hello World");

      const firstProposal = await Proposal.allProposal(0);

      expect(await Proposal.searchProposal(firstProposal.id)).to.deep.equal(
        firstProposal
      );
    });
  });
  describe("Testing closeProposal function", () => {
    it("Should revert if the sender is not the owner", async () => {
      const { otherAccount, Proposal } = await loadFixture(deploy);

      await expect(
        Proposal.connect(otherAccount).closeProposal()
      ).to.revertedWith("Only Owner can call this function");
    });
    it("Should set the proposal to zero and the vote to 1", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await Proposal.connect(owner).closingTokenSale();

      await Proposal.connect(owner).closeProposal();

      expect(await Proposal.proposal()).to.equal(0);
      expect(await Proposal.vote()).to.equal(1);
    });
    it("Should revert if the owner try to reOpen the sales after closing the proposal", async () => {
      const { owner, Proposal } = await loadFixture(deploy);

      await Proposal.connect(owner).closingTokenSale();

      await Proposal.connect(owner).closeProposal();

      await expect(Proposal.connect(owner).openTokenSale()).to.revertedWith(
        "Vote must be close to open token sale"
      );
    });
  });
});
