const hre = require("hardhat");

async function main() {
  const initialAmount = hre.ethers.utils.parseEther("1.1");

  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roul = await Roulette.deploy({ value: initialAmount });

  await roul.deployed();

  console.log(`deployed to ${roul.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
