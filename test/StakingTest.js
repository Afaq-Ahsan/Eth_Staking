const { expect } = require("chai");
const { ethers, waffle} = require("hardhat");
const{ time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking", function () {
  let StakingContract;
  let stakingcontract;

  let Owner;
  let addr1;
  let addr2;
  let addr3;
  //beforeEach is a hook which is provided by mocha framework by using it these functions are call on each case
  beforeEach(async function () {
    StakingContract = await ethers.getContractFactory("StakingContract"); //get contract factory
    [Owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners(); //get signers it means addresses
    stakingcontract = await StakingContract.deploy("0x5223d6f7A87E999D92BeC578349C2625BB4964A2"); //here we deploy our token

    console.log("contract is deployed");
  });


  describe("Check Owner", function () {
    it("Should set the right Owner", async function () {
      expect(await stakingcontract.checkOwner()).to.equal(Owner.address); //check is contract make the right owner
    });
  });

  describe("Check APR", function () {
    it("APR should equal to 50", async function () {
      expect(await stakingcontract.checkAPY()).to.equal(50); 
    });
  });


  

  describe("staking", function () {
    it("should stake the specified amount", async function () {
      const initialBalance = await ethers.provider.getBalance(addr2.address);
      console.log(initialBalance);
      const stakingAmount = ethers.parseEther("1.0");
      await stakingcontract.connect(addr2).Stake({ value: stakingAmount });
  
      expect(await stakingcontract.checkContractBalance()).to.equal(stakingAmount);
    });})
    })
 

