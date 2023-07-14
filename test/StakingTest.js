const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Eth Staking", function () {
  let StakingContract;
  let stakingcontract;
  let vavel;

  let Owner;
  let addr1;
  let addr2;
  let addr3;
  //beforeEach is a hook which is provided by mocha framework by using it these functions are call on each case
  beforeEach(async function () {
    StakingContract = await ethers.getContractFactory("StakingContract");
    [Owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory("VavelToken");
    vavel = await ERC20.deploy();
    stakingcontract = await StakingContract.deploy(vavel);

    await vavel.approve(stakingcontract, ethers.parseEther("5000000000"));
  });

  describe("Check Owner", function () {
    it("Should set the right Owner", async function () {
      expect(await stakingcontract.checkOwner()).to.equal(Owner.address);
    });
  });

  describe("TotalSupply", function () {
    it("should assign the total supply of the token to the owner", async function () {
      const balance = await vavel.balanceOf(Owner.address);
      expect(await vavel.totalSupply()).to.equal(balance);
    });
  });

  describe("Check APY", function () {
    it("APY should equal to 50", async function () {
      expect(await stakingcontract.checkAPY()).to.equal(50);
    });
  });

  describe("staking", function () {
    it("should stake the specified amount", async function () {
      const initialBalance = await ethers.provider.getBalance(addr2.address);
      console.log(initialBalance);
      const stakingAmount = ethers.parseEther("1.0");
      await stakingcontract.connect(addr2).Stake({ value: stakingAmount });
      expect(await stakingcontract.checkContractBalance()).to.equal(
        stakingAmount
      );
    });
  });

  describe("unStaking", function () {
    it("should unStake the specified amount", async function () {
      const initialBalance = await stakingcontract.checkContractBalance();
      console.log(initialBalance);
      const stakingAmount = ethers.parseEther("1.0");
      await stakingcontract.connect(addr2).Stake({ value: stakingAmount });

      await stakingcontract.connect(addr2).unStake();

      const afterBalance = await stakingcontract.checkContractBalance();
      console.log(afterBalance);
      expect(await stakingcontract.checkContractBalance()).to.equal(
        initialBalance
      );
    });
  });

  describe("Checking rewards", function () {
    it("should rewards are transfered to the staker after unStaking", async function () {
      const Tokenbalance = await vavel.balanceOf(addr2);
      console.log("Token Balance", Tokenbalance);

      const stakingAmount = ethers.parseEther("5.0");
      await stakingcontract.connect(addr2).Stake({ value: stakingAmount });

      const beforeBalance = await stakingcontract.checkContractBalance();
      console.log("CHeck balance after staking", beforeBalance);

      await network.provider.send("evm_increaseTime", [3600]); // extend the time for one hour

      await stakingcontract.connect(addr2).unStake();

      const afterBalance = await stakingcontract.checkContractBalance();
      console.log("check balance after unstaking", afterBalance);

      const addressTokens = await vavel.balanceOf(addr2);
      console.log("check erc20 balance of the token", addressTokens);

      expect(addressTokens).to.be.greaterThan(Tokenbalance);
    });
  });

  describe("unStaking Error", function () {
    it("The transaction should revert if you attempt to execute it without staking any ethers", async function () {
      console.log();
      await expect(stakingcontract.connect(addr2).unStake()).to.be.revertedWith(
        "first you need to stake ethers"
      );
    });
  });

  describe("Multiple stakers", function () {
    it("Multiple users have the ability to stake their ethers.", async function () {
      const beforeStakingBalance = await stakingcontract.checkContractBalance();
      console.log("Before staking balance is", beforeStakingBalance);

      const user1Staking = ethers.parseEther("5.0");
      await stakingcontract.connect(addr2).Stake({ value: user1Staking });

      const user2Staking = ethers.parseEther("2.0");
      await stakingcontract.connect(addr3).Stake({ value: user2Staking });

      const afterStakingBalance = await stakingcontract.checkContractBalance();
      console.log("after staking balance is", afterStakingBalance);

      expect(afterStakingBalance).to.equal(ethers.parseEther("7.0")); //check is contract make the right owner
    });
  });

  describe("Staking Amount", function () {
    it("staking amount should be greater than 1 wei", async function () {
      const stakingAmount = ethers.parseEther("0");
      await expect(
        stakingcontract.connect(addr2).Stake({ value: stakingAmount })
      ).to.be.revertedWith("Minimum stake not met");
    });
  });

  describe("Staker's Count", function () {
    it("The number of stakers is equal to the count of stakers", async function () {
      const stakingAddress1 = ethers.parseEther("1.0");
      await stakingcontract.connect(addr1).Stake({ value: stakingAddress1 });

      const stakingAddress2 = ethers.parseEther("1.0");
      await stakingcontract.connect(addr2).Stake({ value: stakingAddress2 });

      const stakingAddress3 = ethers.parseEther("1.0");
      await stakingcontract.connect(addr3).Stake({ value: stakingAddress3 });
      expect(await stakingcontract.noOfStakers()).to.equal(3);
    });
  });

  describe("unStaker's Count", function () {
    it("The number of unStakers is equal to the count of unStakers", async function () {
      const stakingAddress1 = ethers.parseEther("1.0");
      await stakingcontract.connect(addr1).Stake({ value: stakingAddress1 });

      const stakingAddress2 = ethers.parseEther("1.0");
      await stakingcontract.connect(addr2).Stake({ value: stakingAddress2 });

      const stakingAddress3 = ethers.parseEther("1.0");
      await stakingcontract.connect(addr3).Stake({ value: stakingAddress3 });

      await network.provider.send("evm_increaseTime", [3600]);

      await stakingcontract.connect(addr1).unStake();
      await stakingcontract.connect(addr2).unStake();
      await stakingcontract.connect(addr3).unStake();

      expect(await stakingcontract.noOfUnStakers()).to.equal(3);
    });
  });

  describe("Multiple unStaking", function () {
    it("Multiple stakers can stake their ETH, and each staker has the ability to unstake their respective stake.", async function () {
      const stakingAddress1 = ethers.parseEther("8.0");
      await stakingcontract.connect(addr1).Stake({ value: stakingAddress1 });

      const stakingAddress2 = ethers.parseEther("2.0");
      await stakingcontract.connect(addr2).Stake({ value: stakingAddress2 });

      const stakingAddress3 = ethers.parseEther("7.0");
      await stakingcontract.connect(addr3).Stake({ value: stakingAddress3 });

      await network.provider.send("evm_increaseTime", [3600]);

      await stakingcontract.connect(addr1).unStake();

      await stakingcontract.connect(addr3).unStake();

      expect(await stakingcontract.checkContractBalance()).to.equal(
        ethers.parseEther("2.0")
      );
    });
  });
});
