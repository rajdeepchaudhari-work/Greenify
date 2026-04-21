import { ethers, network, run } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying as:', deployer.address);
  console.log('Network:', network.name);

  const Registry = await ethers.getContractFactory('ProjectRegistry');
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();

  const Credit = await ethers.getContractFactory('CarbonCredit');
  const credit = await Credit.deploy(deployer.address, registryAddr, 'ipfs://');
  await credit.waitForDeployment();
  const creditAddr = await credit.getAddress();

  const Market = await ethers.getContractFactory('Marketplace');
  const market = await Market.deploy(creditAddr, deployer.address, deployer.address, 100); // 1% fee
  await market.waitForDeployment();
  const marketAddr = await market.getAddress();

  // Grant the credit contract VERIFIER_ROLE so it can recordIssuance on mint.
  const VERIFIER_ROLE = await registry.VERIFIER_ROLE();
  await (await registry.grantRole(VERIFIER_ROLE, creditAddr)).wait();

  const deployment = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      ProjectRegistry: registryAddr,
      CarbonCredit: creditAddr,
      Marketplace: marketAddr,
    },
    timestamp: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, '..', 'deployments');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${network.name}.json`), JSON.stringify(deployment, null, 2));

  console.log(JSON.stringify(deployment, null, 2));

  if (network.name === 'sepolia' && process.env.ETHERSCAN_API_KEY) {
    console.log('Waiting 30s before verify...');
    await new Promise((r) => setTimeout(r, 30_000));
    try {
      await run('verify:verify', {
        address: registryAddr,
        constructorArguments: [deployer.address],
      });
      await run('verify:verify', {
        address: creditAddr,
        constructorArguments: [deployer.address, registryAddr, 'ipfs://'],
      });
      await run('verify:verify', {
        address: marketAddr,
        constructorArguments: [creditAddr, deployer.address, deployer.address, 100],
      });
    } catch (e) {
      console.warn('Verify failed:', (e as Error).message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
