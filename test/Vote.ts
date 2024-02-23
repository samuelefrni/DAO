import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Vote", () => {
  async function deploy() {
    const totalSupply = ethers.parseEther("100");
    const priceToken = ethers.parseEther("0.2");
    const [owner, otherAccount, otherAccount3] = await ethers.getSigners();
    const Vote = await ethers.deployContract("Vote", [totalSupply, priceToken]);
    return {
      totalSupply,
      priceToken,
      owner,
      otherAccount,
      otherAccount3,
      Vote,
    };
  }
  describe("Testing voteFor function", () => {
    it("Should revert if the sale are open, the proposal are open or the vote are closed", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await expect(Vote.connect(owner).voteFor(9374)).to.revertedWith(
        "The sales must be closed to vote"
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Vote.connect(owner).closingTokenSale();

      await expect(Vote.connect(owner).voteFor(9374)).to.revertedWith(
        "The proposal must be closed to vote"
      );
    });
    it("Should set the proposal to 0 and the vote to 1 after owner call closeProposal function", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(owner).closeProposal();

      expect(await Vote.connect(owner).proposal()).to.equal(0);
      expect(await Vote.connect(owner).vote()).to.equal(1);
    });
    it("Should revert if the sender dont have at least 1 GT to vote", async () => {
      const { owner, otherAccount, otherAccount3, Vote } = await loadFixture(
        deploy
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(owner).closeProposal();

      await expect(Vote.connect(otherAccount3).voteFor(9472)).to.revertedWith(
        "You cannot vote"
      );
    });
    it("Should be revert if the proposal ID is not found and the funds should not be taken", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("5"),
        {
          value: ethers.parseEther("5"),
        }
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(otherAccount).makeProposal("Hello World");

      await Vote.connect(owner).closeProposal();

      await expect(Vote.connect(owner).voteFor(3953241)).to.revertedWith(
        "The proposal id was not found"
      );
      expect(await Vote.balanceOf(owner)).to.equal(ethers.parseEther("2"));
    });
    it("Should vote the proposalId that the sender chose and take 1 GT from the sender", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("5"),
        {
          value: ethers.parseEther("5"),
        }
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(otherAccount).makeProposal("Hello World");

      await Vote.connect(owner).closeProposal();

      await Vote.connect(owner).voteFor((await Vote.allProposal(0)).id);

      expect((await Vote.allProposal(0)).forVotes).to.deep.equal(1);
      expect(await Vote.balanceOf(owner)).to.equal(ethers.parseEther("1"));
    });
  });
  describe("Testing voteAgainst function", () => {
    it("Should revert if the sale are open, the proposal are open or the vote are closed", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await expect(Vote.connect(owner).voteAgainst(9374)).to.revertedWith(
        "The sales must be closed to vote"
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Vote.connect(owner).closingTokenSale();

      await expect(Vote.connect(owner).voteAgainst(9374)).to.revertedWith(
        "The proposal must be closed to vote"
      );
    });
    it("Should revert if the sender dont have at least 1 GT to vote", async () => {
      const { owner, otherAccount, otherAccount3, Vote } = await loadFixture(
        deploy
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(owner).closeProposal();

      await expect(
        Vote.connect(otherAccount3).voteAgainst(9472)
      ).to.revertedWith("You cannot vote");
    });
    it("Should be revert if the proposal ID is not found and the funds should not be taken", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("5"),
        {
          value: ethers.parseEther("5"),
        }
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(otherAccount).makeProposal("Hello World");

      await Vote.connect(owner).closeProposal();

      await expect(Vote.connect(owner).voteAgainst(3953241)).to.revertedWith(
        "The proposal id was not found"
      );
      expect(await Vote.balanceOf(owner)).to.equal(ethers.parseEther("2"));
    });
    it("Should vote the proposalId that the sender chose and take 1 GT from the sender", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("5"),
        {
          value: ethers.parseEther("5"),
        }
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(otherAccount).makeProposal("Hello World");

      await Vote.connect(owner).closeProposal();

      await Vote.connect(owner).voteAgainst((await Vote.allProposal(0)).id);

      expect((await Vote.allProposal(0)).againstVotes).to.equal(1);
      expect(await Vote.balanceOf(owner)).to.equal(ethers.parseEther("1"));
    });
  });
  describe("Testing abstain function", () => {
    it("Should revert if the sales are open", async () => {
      const { owner, Vote } = await loadFixture(deploy);

      await expect(Vote.abstain()).to.revertedWith(
        "The sales must be closed to vote"
      );
    });
    it("Should revert if the proposal are open", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Vote.connect(owner).closingTokenSale();

      await expect(Vote.abstain()).to.revertedWith(
        "The proposal must be closed to vote"
      );
    });
    it("Should revert if the sender does not have at least 1 GT", async () => {
      const { owner, otherAccount, otherAccount3, Vote } = await loadFixture(
        deploy
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(owner).closeProposal();

      await expect(Vote.connect(otherAccount3).abstain()).to.revertedWith(
        "You cannot vote"
      );
    });
    it("Should set the value 'voted' of the sender to true without taking GT", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        {
          value: ethers.parseEther("2"),
        }
      );

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(owner).closeProposal();

      await Vote.connect(owner).abstain();

      expect(await Vote.balanceOf(owner)).to.equal(ethers.parseEther("2"));
      expect((await Vote._allDAOMember(0)).voted).to.equal(true);
    });
  });
  describe("Testing closeVote function", () => {
    it("Should revert if the deadline is not passed", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("5"),
        {
          value: ethers.parseEther("5"),
        }
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(otherAccount).makeProposal("Hello World");

      await Vote.connect(owner).closeProposal();

      await expect(Vote.connect(owner).closeVote()).to.revertedWith(
        "Voting will close 7 day from the first closeProposal call"
      );
    });
    it("Should set vote to 0 and executive to 1 if the deadline has expired", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("5"),
        {
          value: ethers.parseEther("5"),
        }
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(otherAccount).makeProposal("Hello World");

      await Vote.connect(owner).closeProposal();

      await ethers.provider.send("evm_increaseTime", [604800]);

      await ethers.provider.send("evm_mine");

      await Vote.connect(owner).closeVote();

      expect(await Vote.vote()).to.equal(0);
      expect(await Vote.executive()).to.equal(1);
    });
    it("Should remove the member who did not vote", async () => {
      const { owner, otherAccount, Vote } = await loadFixture(deploy);

      await Vote.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("5"),
        {
          value: ethers.parseEther("5"),
        }
      );

      await Vote.connect(owner).buyGovernanceToken(ethers.parseEther("2"), {
        value: ethers.parseEther("2"),
      });

      await Vote.connect(owner).closingTokenSale();

      await Vote.connect(otherAccount).makeProposal("Hello World");

      await Vote.connect(owner).closeProposal();

      await ethers.provider.send("evm_increaseTime", [604800]);

      await ethers.provider.send("evm_mine");

      await Vote.connect(owner).closeVote();

      await expect(Vote.connect(owner).isDAOMember()).to.revertedWith(
        "To be a DAO member you should have at least 1 GT"
      );
      expect(await Vote.balanceOf(owner)).to.equal(ethers.parseEther("0"));
    });
  });
});
