import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Executive", () => {
  async function deploy() {
    const totalSupply = ethers.parseEther("10");
    const priceToken = ethers.parseEther("1");
    const [owner, otherAccount] = await ethers.getSigners();
    const Executive = await ethers.deployContract("Executive", [
      totalSupply,
      priceToken,
    ]);
    return { totalSupply, priceToken, owner, otherAccount, Executive };
  }
  describe("Testing executeProposal function", () => {
    it("Should revert if the executive are closed", async () => {
      const { Executive } = await loadFixture(deploy);

      await expect(Executive.executeProposal(1234)).to.revertedWith(
        "To execute a proposal the vote must be closed"
      );
    });
    it("Should revert if the proposal does not exist", async () => {
      const { owner, otherAccount, Executive } = await loadFixture(deploy);

      await Executive.connect(owner).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Executive.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Executive.connect(owner).closingTokenSale();

      await Executive.connect(owner).closeProposal();

      await ethers.provider.send("evm_increaseTime", [604800]);

      await ethers.provider.send("evm_mine");

      await Executive.connect(owner).closeVote();

      await expect(Executive.executeProposal(1234)).to.revertedWith(
        "Proposal not found"
      );
    });
    it("Should execute the proposal and rejected it, after set the status to rejected and executed to true", async () => {
      const { owner, otherAccount, Executive } = await loadFixture(deploy);

      await Executive.connect(owner).buyGovernanceToken(
        ethers.parseEther("5"),
        { value: ethers.parseEther("5") }
      );

      await Executive.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      await Executive.connect(owner).closingTokenSale();

      await Executive.connect(owner).makeProposal("Hello World");

      await Executive.connect(owner).closeProposal();

      await Executive.connect(otherAccount).voteAgainst(
        (
          await Executive.allProposal(0)
        ).id
      );

      await ethers.provider.send("evm_increaseTime", [604800]);

      await ethers.provider.send("evm_mine");

      await Executive.connect(owner).closeVote();

      await Executive.executeProposal((await Executive.allProposal(0)).id);

      expect((await Executive.allProposal(0)).executed).to.equal(true);
      expect((await Executive.allProposal(0)).status).to.equal("rejected");
    });
    it("Should execute the proposal and approved it, after set the status to approved, executed to true and push it to executedProposal", async () => {
      const { owner, otherAccount, Executive } = await loadFixture(deploy);

      await Executive.connect(owner).buyGovernanceToken(
        ethers.parseEther("5"),
        { value: ethers.parseEther("5") }
      );

      await Executive.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      await Executive.connect(owner).closingTokenSale();

      await Executive.connect(owner).makeProposal("Hello World");

      await Executive.connect(owner).closeProposal();

      await Executive.connect(otherAccount).voteFor(
        (
          await Executive.allProposal(0)
        ).id
      );

      await ethers.provider.send("evm_increaseTime", [604800]);

      await ethers.provider.send("evm_mine");

      await Executive.connect(owner).closeVote();

      await Executive.executeProposal((await Executive.allProposal(0)).id);

      expect((await Executive.allProposal(0)).executed).to.equal(true);
      expect((await Executive.allProposal(0)).status).to.equal("approved");
      expect(await Executive.executedProposal(0)).to.equal(
        (await Executive.allProposal(0)).id
      );
    });
    it("Should revert if the proposal are already executed", async () => {
      const { owner, otherAccount, Executive } = await loadFixture(deploy);

      await Executive.connect(owner).buyGovernanceToken(
        ethers.parseEther("5"),
        { value: ethers.parseEther("5") }
      );

      await Executive.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      await Executive.connect(owner).closingTokenSale();

      await Executive.connect(owner).makeProposal("Hello World");

      await Executive.connect(owner).closeProposal();

      await Executive.connect(otherAccount).voteFor(
        (
          await Executive.allProposal(0)
        ).id
      );

      await ethers.provider.send("evm_increaseTime", [604800]);

      await ethers.provider.send("evm_mine");

      await Executive.connect(owner).closeVote();

      await Executive.executeProposal((await Executive.allProposal(0)).id);

      await expect(
        Executive.executeProposal((await Executive.allProposal(0)).id)
      ).to.revertedWith(
        "Proposal already executed, check the allProposal array or executedProposal to see the results"
      );
    });
  });
  describe("Testing closeExecutive function", () => {
    it("Should revert if the sender is not the owner", async () => {
      const { otherAccount, Executive } = await loadFixture(deploy);

      await expect(
        Executive.connect(otherAccount).closeExecutive()
      ).to.revertedWith("Only Owner can call this function");
    });
    it("Should revert if the executive are already closed", async () => {
      const { owner, Executive } = await loadFixture(deploy);

      await expect(Executive.connect(owner).closeExecutive()).to.revertedWith(
        "Executive are already closed"
      );
    });
    it("Should revert if all existing proposals are not executed", async () => {
      const { owner, otherAccount, Executive } = await loadFixture(deploy);

      await Executive.connect(owner).buyGovernanceToken(
        ethers.parseEther("5"),
        { value: ethers.parseEther("5") }
      );

      await Executive.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      await Executive.connect(owner).closingTokenSale();

      await Executive.connect(owner).makeProposal("Hello World");

      await Executive.connect(owner).closeProposal();

      await Executive.connect(otherAccount).voteAgainst(
        (
          await Executive.allProposal(0)
        ).id
      );

      await ethers.provider.send("evm_increaseTime", [604800]);

      await ethers.provider.send("evm_mine");

      await Executive.connect(owner).closeVote();

      await expect(Executive.connect(owner).closeExecutive()).to.revertedWith(
        "Before closing the executive all proposal must be executed"
      );
    });
    it("Should set the executive to close", async () => {
      const { owner, otherAccount, Executive } = await loadFixture(deploy);

      await Executive.connect(owner).buyGovernanceToken(
        ethers.parseEther("5"),
        { value: ethers.parseEther("5") }
      );

      await Executive.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      await Executive.connect(owner).closingTokenSale();

      await Executive.connect(owner).makeProposal("Hello World");

      await Executive.connect(owner).closeProposal();

      await Executive.connect(otherAccount).voteAgainst(
        (
          await Executive.allProposal(0)
        ).id
      );

      await ethers.provider.send("evm_increaseTime", [604800]);

      await ethers.provider.send("evm_mine");

      await Executive.connect(owner).closeVote();

      await Executive.executeProposal((await Executive.allProposal(0)).id);

      await Executive.connect(owner).closeExecutive();

      expect(await Executive.proposal()).to.equal(0);
    });
  });
});
