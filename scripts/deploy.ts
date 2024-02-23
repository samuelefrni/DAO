import { ethers } from "hardhat";

async function main() {
  const totalSupply = ethers.parseEther("100");
  const priceToken = ethers.parseEther("0.2");
  const [account] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", account.address);

  const DAO = await ethers.deployContract("DAO", [totalSupply, priceToken]);

  await DAO.waitForDeployment();

  console.log(`Contract address: ${await DAO.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
