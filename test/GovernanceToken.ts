import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("GovernanceToken", () => {
  async function deploy() {
    const totalSupply = ethers.parseEther("10");
    const priceToken = ethers.parseEther("1");
    const [owner, otherAccount] = await ethers.getSigners();
    const GovernanceToken = await ethers.deployContract("GovernanceToken", [
      totalSupply,
      priceToken,
    ]);
    return { totalSupply, priceToken, owner, otherAccount, GovernanceToken };
  }
  describe("Testing GovernanceToken creation", () => {
    it("Should return the correct info about the token", async () => {
      const { totalSupply, priceToken, GovernanceToken } = await loadFixture(
        deploy
      );
      expect(await GovernanceToken.name()).to.equal("GovernanceToken");
      expect(await GovernanceToken.symbol()).to.equal("GT");
      expect(await GovernanceToken.totalSupply()).to.equal(totalSupply);
      expect(await GovernanceToken.price()).to.equal(priceToken);
    });
    it("Should set the right contract information", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      expect(await GovernanceToken._owner()).to.equal(owner);
      expect(await GovernanceToken.sales()).to.equal(1);
      expect(await GovernanceToken.proposal()).to.equal(0);
      expect(await GovernanceToken.vote()).to.equal(0);
      expect(await GovernanceToken.executive()).to.equal(0);
    });
  });

  describe("Testing buyGovernanceToken function", () => {
    it("Should revert if the sales are closed", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(owner).closingTokenSale();
      await expect(
        GovernanceToken.connect(owner).buyGovernanceToken(
          ethers.parseEther("2"),
          { value: ethers.parseEther("5") }
        )
      ).to.revertedWith("Sales of the token are close");
    });
    it("Should revert if the amount that the user wanna buy is less than 1 ether", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).buyGovernanceToken(
          ethers.parseEther("0.5"),
          { value: ethers.parseEther("5") }
        )
      ).to.revertedWith("The minimum spend is 1 ether");
    });
    it("Should revert if the user don't have enough funds to buy the amount of tokens", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).buyGovernanceToken(
          ethers.parseEther("2"),
          { value: ethers.parseEther("1") }
        )
      ).to.revertedWith("Insufficient funds");
    });
    it("Should revert if the user try to buy/hold more than 5 GovernanceToken", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).buyGovernanceToken(
          ethers.parseEther("6"),
          { value: ethers.parseEther("10") }
        )
      ).to.revertedWith("You cant hold more than 5 GovernanceToken");
      await GovernanceToken.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("3"),
        { value: ethers.parseEther("10") }
      );
      await expect(
        GovernanceToken.connect(otherAccount).buyGovernanceToken(
          ethers.parseEther("3"),
          { value: ethers.parseEther("10") }
        )
      ).to.revertedWith("You cant hold more than 5 GovernanceToken");
    });
    it("Should revert if the user try to send ERC-20 to the contract", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        otherAccount.sendTransaction({
          to: GovernanceToken,
          value: ethers.parseEther("2"),
        })
      ).to.revertedWith("This contract does not accept ether directly");
    });
    it("Should transfer the correct amount of GovernanceToken to the buyer and give it the DAO member", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("5"),
        { value: ethers.parseEther("10") }
      );
      expect(await GovernanceToken.balanceOf(otherAccount)).to.equal(
        ethers.parseEther("5")
      );
      expect(await GovernanceToken._isDAOMember(otherAccount)).to.equal(true);
      expect((await GovernanceToken._allDAOMember(0)).memberAddress).to.equal(
        otherAccount.address
      );
    });
  });
  describe("Testing isDAOMember function", () => {
    it("Should revert if the user dont is a DAO member", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).isDAOMember()
      ).to.revertedWith("To be a DAO member you should have at least 1 GT");
    });
    it("Should return true after the purchase of at least 1 GT", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      expect(
        await GovernanceToken.connect(otherAccount).isDAOMember()
      ).to.equal(true);
    });
  });
  describe("Testing closingTokenSale function", () => {
    it("Should revert if otherAccount try to call closingTokenSale function", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).closingTokenSale()
      ).to.revertedWith("Only Owner can call this function");
    });
    it("Should revert if the owner try to close the sales but they are already closed", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(owner).closingTokenSale();
      await expect(
        GovernanceToken.connect(owner).closingTokenSale()
      ).to.revertedWith("Sales are already closed");
    });
    it("Should set sales to 0 and proposal to 1", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(owner).closingTokenSale();
      expect(await GovernanceToken.sales()).to.equal(0);
      expect(await GovernanceToken.proposal()).to.equal(1);
    });
  });
  describe("Testing openTokenSale function", () => {
    it("Should revert if otherAccount try to call openTokenSale function", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).openTokenSale()
      ).to.revertedWith("Only Owner can call this function");
    });
    it("Should revert if the owner try to open the sales but they are already open", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(owner).openTokenSale()
      ).to.revertedWith("Sales are already open");
    });
    it("Should revert if the owner try to reOpen the sales after the closingTokenSale function", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(owner).closingTokenSale();

      await expect(
        GovernanceToken.connect(owner).openTokenSale()
      ).to.revertedWith("Proposal must be close to open token sale");
    });
  });
});
