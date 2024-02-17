import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("GovernanceToken", () => {
  async function deploy() {
    const totalSupply = ethers.parseEther("100");
    const priceToken = ethers.parseEther("1");
    const [owner, otherAccount] = await ethers.getSigners();
    const GovernanceToken = await ethers.deployContract("GovernanceToken", [
      totalSupply,
      priceToken,
    ]);

    return { totalSupply, priceToken, owner, otherAccount, GovernanceToken };
  }

  describe("Testing the creation of the GovernanceToken", () => {
    it("Should set the correct info about the token", async () => {
      const { totalSupply, priceToken, GovernanceToken } = await loadFixture(
        deploy
      );

      expect(await GovernanceToken.name()).to.equal("GovernanceToken");
      expect(await GovernanceToken.symbol()).to.equal("GT");
      expect(await GovernanceToken.totalSupply()).to.equal(totalSupply);
      expect(await GovernanceToken.price()).to.equal(priceToken);
    });
    it("Should set the right Owner and check that the Owner doesn't have GovernanceToken", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      expect(await GovernanceToken._owner()).to.equal(owner);
      expect(await GovernanceToken.balanceOf(owner)).to.equal(0);
    });
  });

  describe("Testing the safe sale of the GovernanceToken and the assign of the DAO member", () => {
    it("Should transfer the correct amount of GovernanceToken to the address who buy it", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      expect(await GovernanceToken.balanceOf(otherAccount)).to.equal(
        ethers.parseEther("2")
      );
    });
    it("Should assign the DAO member after the correct purchase of (at least) 1 GovernanceToken to the address who buy it", async () => {
      const { owner, otherAccount, GovernanceToken } = await loadFixture(
        deploy
      );

      await GovernanceToken.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("2"),
        { value: ethers.parseEther("2") }
      );

      expect(await GovernanceToken.balanceOf(otherAccount)).to.equal(
        ethers.parseEther("2")
      );

      expect(await GovernanceToken._isDAOMember(otherAccount)).to.equal(true);
      expect(await GovernanceToken._isDAOMember(owner)).to.equal(false);
    });
  });

  describe("Testing open and closing token sales", () => {
    it("Should close the token sales", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(owner).closingTokenSale();

      expect(await GovernanceToken.sales()).to.equal(0);
    });
    it("Should open the token sales", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(owner).closingTokenSale();

      expect(await GovernanceToken.sales()).to.equal(0);

      await GovernanceToken.openTokenSale();

      expect(await GovernanceToken.sales()).to.equal(1);
    });
  });

  describe("Testing case of all revert error of the contract", () => {
    it("Should revert if the user try to buy GT but the sales are closed", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await GovernanceToken.connect(owner).closingTokenSale();

      await expect(
        GovernanceToken.buyGovernanceToken(ethers.parseEther("2"))
      ).to.revertedWith("Sales of the token are close");
    });
    it("Should revert if the user try to buy less than 1 GT", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).buyGovernanceToken(
          ethers.parseEther("0.5")
        )
      ).to.revertedWith("The minimum spend is 1 ether");
    });
    it("Should revert if the user dont have funds", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).buyGovernanceToken(
          ethers.parseEther("2"),
          { value: ethers.parseEther("1") }
        )
      ).to.revertedWith("Insufficient funds");
    });
    it("Should revert if the user try to buy more than 5 GT", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).buyGovernanceToken(
          ethers.parseEther("6"),
          { value: ethers.parseEther("6") }
        )
      ).to.revertedWith("You cant hold more than 5 GovernanceToken");

      await GovernanceToken.connect(otherAccount).buyGovernanceToken(
        ethers.parseEther("4"),
        { value: ethers.parseEther("4") }
      );

      await expect(
        GovernanceToken.connect(otherAccount).buyGovernanceToken(
          ethers.parseEther("2"),
          { value: ethers.parseEther("2") }
        )
      ).to.revertedWith("You cant hold more than 5 GovernanceToken");
    });
    it("Should revert if the user try to close/open the token sales", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(otherAccount).closingTokenSale()
      ).to.revertedWith("Only Owner can call this function");

      await expect(
        GovernanceToken.connect(otherAccount).openTokenSale()
      ).to.revertedWith("Only Owner can call this function");
    });
    it("Should revert if the owner try to close/open the token sales and it is already close/open", async () => {
      const { owner, GovernanceToken } = await loadFixture(deploy);

      await expect(
        GovernanceToken.connect(owner).openTokenSale()
      ).to.revertedWith("Sales are already open");

      await GovernanceToken.connect(owner).closingTokenSale();

      await expect(
        GovernanceToken.connect(owner).closingTokenSale()
      ).to.revertedWith("Sales are already closed");
    });
    it("Should revert if the user try so send ERC-20 to the contract", async () => {
      const { otherAccount, GovernanceToken } = await loadFixture(deploy);

      await expect(
        otherAccount.sendTransaction({
          to: GovernanceToken,
          value: ethers.parseEther("2"),
        })
      ).to.revertedWith("This contract does not accept ether directly");
    });
  });
});
