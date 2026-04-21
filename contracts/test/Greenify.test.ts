import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Greenify', () => {
  async function deployFixture() {
    const [admin, projectOwner, buyer, other] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory('ProjectRegistry');
    const registry = await Registry.deploy(admin.address);

    const Credit = await ethers.getContractFactory('CarbonCredit');
    const credit = await Credit.deploy(admin.address, await registry.getAddress(), 'ipfs://');

    const Market = await ethers.getContractFactory('Marketplace');
    const market = await Market.deploy(
      await credit.getAddress(),
      admin.address,
      admin.address,
      100, // 1%
    );

    const VERIFIER_ROLE = await registry.VERIFIER_ROLE();
    await registry.grantRole(VERIFIER_ROLE, await credit.getAddress());

    return { admin, projectOwner, buyer, other, registry, credit, market };
  }

  describe('ProjectRegistry', () => {
    it('registers a project and emits event', async () => {
      const { registry, projectOwner } = await loadFixture(deployFixture);
      await expect(registry.connect(projectOwner).registerProject('QmCid1'))
        .to.emit(registry, 'ProjectRegistered')
        .withArgs(0, projectOwner.address, 'QmCid1');
      expect((await registry.getProject(0)).owner).to.equal(projectOwner.address);
    });

    it('only verifier can approve', async () => {
      const { registry, projectOwner, other } = await loadFixture(deployFixture);
      await registry.connect(projectOwner).registerProject('QmCid');
      await expect(registry.connect(other).approveProject(0)).to.be.reverted;
    });

    it('reverts approving unknown project', async () => {
      const { registry } = await loadFixture(deployFixture);
      await expect(registry.approveProject(42)).to.be.revertedWithCustomError(
        registry,
        'ProjectNotFound',
      );
    });

    it('reverts double approval', async () => {
      const { registry, projectOwner } = await loadFixture(deployFixture);
      await registry.connect(projectOwner).registerProject('QmCid');
      await registry.approveProject(0);
      await expect(registry.approveProject(0)).to.be.revertedWithCustomError(
        registry,
        'ProjectAlreadyApproved',
      );
    });
  });

  describe('CarbonCredit', () => {
    it('mints credits for an approved project', async () => {
      const { registry, credit, projectOwner, admin } = await loadFixture(deployFixture);
      await registry.connect(projectOwner).registerProject('QmCid');
      await registry.approveProject(0);
      await credit.connect(admin).mint(projectOwner.address, 0, 100);
      expect(await credit.balanceOf(projectOwner.address, 0)).to.equal(100);
      expect((await registry.getProject(0)).totalIssued).to.equal(100);
    });

    it('reverts minting for unapproved project', async () => {
      const { registry, credit, projectOwner, admin } = await loadFixture(deployFixture);
      await registry.connect(projectOwner).registerProject('QmCid');
      await expect(
        credit.connect(admin).mint(projectOwner.address, 0, 10),
      ).to.be.revertedWithCustomError(credit, 'ProjectNotApproved');
    });

    it('retires credits and burns them', async () => {
      const { registry, credit, projectOwner, admin } = await loadFixture(deployFixture);
      await registry.connect(projectOwner).registerProject('QmCid');
      await registry.approveProject(0);
      await credit.connect(admin).mint(projectOwner.address, 0, 50);

      await expect(credit.connect(projectOwner).retire(0, 20))
        .to.emit(credit, 'CreditsRetired')
        .withArgs(projectOwner.address, 0, 20);
      expect(await credit.balanceOf(projectOwner.address, 0)).to.equal(30);
    });

    it('retire reverts on insufficient balance', async () => {
      const { credit, projectOwner } = await loadFixture(deployFixture);
      await expect(credit.connect(projectOwner).retire(0, 1)).to.be.revertedWithCustomError(
        credit,
        'InsufficientBalance',
      );
    });
  });

  describe('Marketplace', () => {
    async function seeded() {
      const ctx = await loadFixture(deployFixture);
      const { registry, credit, market, projectOwner, admin } = ctx;
      await registry.connect(projectOwner).registerProject('QmCid');
      await registry.approveProject(0);
      await credit.connect(admin).mint(projectOwner.address, 0, 100);
      await credit.connect(projectOwner).setApprovalForAll(await market.getAddress(), true);
      return ctx;
    }

    it('lists, buys partially, then cancels remainder', async () => {
      const { market, credit, projectOwner, buyer } = await seeded();

      const price = ethers.parseEther('0.01');
      await expect(market.connect(projectOwner).list(0, 40, price))
        .to.emit(market, 'Listed')
        .withArgs(0, projectOwner.address, 0, 40, price);

      const total = price * 10n;
      await expect(market.connect(buyer).buy(0, 10, { value: total })).to.emit(market, 'Sold');

      expect(await credit.balanceOf(buyer.address, 0)).to.equal(10);

      await expect(market.connect(projectOwner).cancel(0)).to.emit(market, 'Cancelled');
      // 30 remaining return to seller; initial balance 100 - 40 listed + 30 returned + 0 sold = 90
      expect(await credit.balanceOf(projectOwner.address, 0)).to.equal(90);
    });

    it('buy reverts with insufficient payment', async () => {
      const { market, projectOwner, buyer } = await seeded();
      const price = ethers.parseEther('0.01');
      await market.connect(projectOwner).list(0, 10, price);
      await expect(
        market.connect(buyer).buy(0, 5, { value: price * 4n }),
      ).to.be.revertedWithCustomError(market, 'InsufficientPayment');
    });

    it('only seller can cancel', async () => {
      const { market, projectOwner, other } = await seeded();
      await market.connect(projectOwner).list(0, 10, ethers.parseEther('0.01'));
      await expect(market.connect(other).cancel(0)).to.be.revertedWithCustomError(
        market,
        'NotSeller',
      );
    });

    it('fee goes to recipient', async () => {
      const { market, admin, projectOwner, buyer } = await seeded();
      const price = ethers.parseEther('1');
      await market.connect(projectOwner).list(0, 1, price);

      const before = await ethers.provider.getBalance(admin.address);
      await market.connect(buyer).buy(0, 1, { value: price });
      const after = await ethers.provider.getBalance(admin.address);

      // fee is 1% of 1 ETH = 0.01 ETH (admin is both fee recipient and may be seller? here seller=projectOwner)
      expect(after - before).to.equal(ethers.parseEther('0.01'));
    });

    it('rejects fee above cap', async () => {
      const { market } = await seeded();
      await expect(market.setFee(1001, ethers.ZeroAddress)).to.be.revertedWithCustomError(
        market,
        'InvalidFee',
      );
    });
  });
});
