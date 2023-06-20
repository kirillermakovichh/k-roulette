const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contract } = require("ethers");
const Roulette = require("../artifacts/contracts/Roulette.sol/Roulette.json");
const ROULLETE_TEST_ADDRESS = process.env.ROULLETE_TEST_ADDRESS;
const Link = require("../artifacts/@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol/LinkTokenInterface.json");
const LINK_ADDRESS = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

describe.only("AnotherRoulette", function () {
  let roulette;
  let user1;
  let user2;

  beforeEach(async function () {
    [user1, user2] = await ethers.getSigners();
    roulette = new Contract(ROULLETE_TEST_ADDRESS, Roulette.abi, user1);
    link = new Contract(LINK_ADDRESS, Link.abi, user1);
  });

  async function getTimestamp(bn) {
    return (await ethers.provider.getBlock(bn)).timestamp;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  describe("If no one is in the game.", function () {
    describe("spin()", function () {
      it("should only allow spinning when there is at least one player", async function () {
        await expect(roulette.spin()).to.be.revertedWith("Nobody in the game.");
      });
    });
  });

  describe("If bets placed but timer has not expired or game is active.", function () {
    describe("spin()", function () {
      it("should only allow spinning after the timer expires", async function () {
        const betNumber = 1;
        const betType = 0; // bet on color
        const tx = await roulette.placeBet(betNumber, betType, {
          value: ethers.utils.parseEther("0.001"),
          gasLimit: 1000000,
        });
        await tx.wait();

        await expect(roulette.spin()).to.be.revertedWith(
          "Timer has not expired."
        );
      });

      it("spinning after the timer expires", async function () {
        // Wait 32 seconds to expire the timer.
        await delay(32000);
        const tx = await roulette.spin({
          gasLimit: 1000000,
        });
        await tx.wait();
      });
      it("should not allow spin when game is active", async function () {
        await expect(roulette.spin()).to.be.revertedWith("Game is active.");
      });
    });

    describe("Complete the game/fulfillRandomWords()", function () {
      it("wait 80 seconds to get response from ChainLink.", async function () {
        await delay(80000);
      });

      it('should fulfill the random words, delete players and emit "GameStarted"', async function () {
        const gameId = await roulette.gamesCount();
        const game = await roulette.games(gameId - 1);
        expect(game.fulfilled).to.equal(true);

        const player = await roulette.players(user1.address);
        expect(player.betType).to.equal(0);
        expect(player.number).to.equal(0);
        expect(player.isExists).to.equal(false);

        //Reading last emitted event "Random Number" and comparing args.
        let filter = roulette.filters.RandomNumber(null, null);
        const event = await roulette.queryFilter(filter, 3682276, 4682276);

        const emitedGameId = Number(event[gameId - 1].topics[1]);
        const emitedRandomNumber = Number(event[gameId - 1].topics[2]);

        expect(emitedGameId).to.equal(gameId - 1);
        expect(emitedRandomNumber).below(37);
      });
    });
  });

  describe("If all is met.", function () {
    describe("contract", function () {
      it("should set owner correctly", async function () {
        expect(await roulette.owner()).to.equal(user1.address);
      });
    });

    describe("placeBet()", function () {
      it("should not allow placing a bet without entry fees", async function () {
        const betNumber = 1;
        const betType = 0; // bet on color
        await expect(roulette.placeBet(betNumber, betType)).to.be.revertedWith(
          "Entry fees not sent."
        );
      });

      it("should not allow placing a bet with incorrect bet type", async function () {
        const betNumber = 1;
        const betType = 6; // incorrect bet type
        await expect(
          roulette.placeBet(betNumber, betType, {
            value: ethers.utils.parseEther("0.001"),
          })
        ).to.be.revertedWith("Incorrect bet type or value.");
      });

      it("should not allow placing a bet with incorrect value", async function () {
        const betNumber = 10; // incorrect value
        const betType = 0; // bet on color
        await expect(
          roulette.placeBet(betNumber, betType, {
            value: ethers.utils.parseEther("0.001"),
          })
        ).to.be.revertedWith("Incorrect bet type or value.");
      });

      it('should allow a player to place a bet and emit "GameStarted"', async function () {
        const betNumber = 1;
        const betType = 0; // bet on color
        const tx = await roulette.placeBet(betNumber, betType, {
          value: ethers.utils.parseEther("0.001"),
          gasLimit: 1000000,
        });
        await tx.wait();
        const ts = await getTimestamp(tx.blockNumber);

        const gameId = await roulette.gamesCount();
        const game = await roulette.games(gameId);

        await expect(tx).to.emit(roulette, "GameStarted").withArgs(gameId, ts);

        expect(game.startAt).to.equal(ts);
        expect(game.started).to.equal(true);
        expect(game.isActive).to.equal(false);
        expect(game.fulfilled).to.equal(false);
        expect(game.paid).to.equal(0);

        const player = await roulette.players(user1.address);

        expect(player.isExists).to.equal(true);
        expect(player.betType).to.equal(betType);
        expect(player.number).to.equal(betNumber);
      });

      it("should not allow placing more than one bet", async function () {
        const betNumber = 1;
        const betType = 0; // bet on color
        await expect(
          roulette.placeBet(betNumber, betType, {
            value: ethers.utils.parseEther("0.001"),
          })
        ).to.be.revertedWith("You can only place one bet.");
      });

      it("should not place a bet when the timer expires", async function () {
        // Wait 35 seconds to expire the timer.
        await delay(35000);

        const betNumber = 1;
        const betType = 0; // bet on color
        await expect(
          roulette.connect(user2).placeBet(betNumber, betType, {
            value: ethers.utils.parseEther("0.001"),
          })
        ).to.be.revertedWith("Timer expired. Wait for new game.");
      });
    });

    describe("spin()", function () {
      it("should only allow a player or the owner to spin", async function () {
        await expect(roulette.connect(user2).spin()).to.be.revertedWith(
          "Only the player or owner can spin."
        );
      });

      it("should allow spinning", async function () {
        const tx = await roulette.spin({
          gasLimit: 1000000,
        });
        await tx.wait();

        const gameId = await roulette.gamesCount();
        const game = await roulette.games(gameId);

        expect(game.isActive).to.equal(true);
      });
    });

    describe("fulfillRandomWords()", function () {
      it("wait 80 seconds to get response from ChainLink.", async function () {
        await delay(80000);
      });

      it('should fulfill the random words, delete players and emit "GameStarted"', async function () {
        const gameId = await roulette.gamesCount();
        const game = await roulette.games(gameId - 1);
        expect(game.fulfilled).to.equal(true);

        const player = await roulette.players(user1.address);
        expect(player.betType).to.equal(0);
        expect(player.number).to.equal(0);
        expect(player.isExists).to.equal(false);

        //Reading last emitted event "Random Number" and comparing args.
        let filter = roulette.filters.RandomNumber(null, null);
        const event = await roulette.queryFilter(filter, 3682276, 4682276);

        const emitedGameId = Number(event[gameId - 1].topics[1]);
        const emitedRandomNumber = Number(event[gameId - 1].topics[2]);

        expect(emitedGameId).to.equal(gameId - 1);
        expect(emitedRandomNumber).below(37);
      });

      it("should start a new game after fulfilling the random words", async function () {
        const betNumber = 0;
        const betType = 0; // bet on color
        const gameId = await roulette.gamesCount();
        const gamePrev = await roulette.games(gameId - 1);

        expect(gamePrev.fulfilled).to.equal(true);

        const tx = await roulette.placeBet(betNumber, betType, {
          value: ethers.utils.parseEther("0.001"),
          gasLimit: 1000000,
        });
        await tx.wait();

        const gameCur = await roulette.games(gameId);
        expect(gameCur.started).to.equal(true);
      });
    });

    describe("Complete the game", function () {
      it("spinning after the timer expires", async function () {
        // Wait 32 seconds to expire the timer.
        await delay(32000);
        const tx = await roulette.spin({
          gasLimit: 1000000,
        });
        await tx.wait();
      });
      it("wait 80 seconds to get response from ChainLink.", async function () {
        await delay(80000);
      });

      it('should fulfill the random words, delete players and emit "GameStarted"', async function () {
        const gameId = await roulette.gamesCount();
        const game = await roulette.games(gameId - 1);
        expect(game.fulfilled).to.equal(true);
        
        await delay(2000);
        const player = await roulette.players(user1.address);
        expect(player.betType).to.equal(0);
        expect(player.number).to.equal(0);
        expect(player.isExists).to.equal(false);

        //Reading last emitted event "Random Number" and comparing args.
        let filter = roulette.filters.RandomNumber(null, null);
        const event = await roulette.queryFilter(filter, 3682276, 4682276);

        const emitedGameId = Number(event[gameId - 1].topics[1]);
        const emitedRandomNumber = Number(event[gameId - 1].topics[2]);

        expect(emitedGameId).to.equal(gameId - 1);
        expect(emitedRandomNumber).below(37);
      });
    });

    describe("cashOut()", function () {
      it("should allow a player to cash out winnings", async function () {
        const balances = await roulette.getBalances();
        const userWinnings = Number(balances[1]);

        const userBalanceBefore = await ethers.provider.getBalance(
          user1.address
        );

        if (userWinnings > 0) {
          const tx = await roulette.connect(user1).cashOut();
          await tx.wait();

          const userBalanceAfter = await ethers.provider.getBalance(
            user1.address
          );
          const balanceDif = userBalanceAfter - userBalanceBefore;
          expect(balanceDif).greaterThan(0);
        }
      });

      it("should not allow a player to cash out if he have no winnings", async function () {
        await expect(roulette.cashOut()).to.be.revertedWith(
          "You have no winnings."
        );
      });
    });

    describe("safeWithdraw()", function () {
      it("should allow an owner to withdraw funds safely", async function () {
        const balances = await roulette.getBalances();
        const contractBalance = Number(balances[0]);
        const ownerprofit = contractBalance - ethers.utils.parseEther("1.0");
        const userBalanceBefore = await ethers.provider.getBalance(
          user1.address
        );

        if (ownerprofit > 0) {
          const tx = await roulette.safeWithdraw({ gasLimit: 100000 });
          await tx.wait();

          const userBalanceAfter = await ethers.provider.getBalance(
            user1.address
          );
          const balanceDif = userBalanceAfter - userBalanceBefore;
          expect(balanceDif).greaterThan(0);
        }
      });

      it("should allow only owner to withdraw funds safely", async function () {
        await expect(roulette.connect(user2).safeWithdraw()).to.be.revertedWith(
          "Not an owner."
        );
      });

      it("should be enough money to withdraw funds safely", async function () {
        await expect(roulette.safeWithdraw()).to.be.revertedWith(
          "Not enough money to safe withdraw."
        );
      });
    });

    describe("allWithdraw()", function () {
      it("should allow an owner to withdraw all funds", async function () {
        const balances = await roulette.getBalances();
        const contractBalance = Number(balances[0]);
        const userBalanceBefore = await ethers.provider.getBalance(
          user1.address
        );

        if (contractBalance > 0) {
          const tx = await roulette.allWithdraw({ gasLimit: 100000 });
          await tx.wait();

          const userBalanceAfter = await ethers.provider.getBalance(
            user1.address
          );
          const balanceDif = userBalanceAfter - userBalanceBefore;
          expect(balanceDif).greaterThan(0);
        }
      });

      it("should allow only owner to withdraw all funds", async function () {
        await expect(roulette.connect(user2).allWithdraw()).to.be.revertedWith(
          "Not an owner."
        );
      });

      it("should be enough money to withdraw all funds", async function () {
        await expect(roulette.allWithdraw()).to.be.revertedWith(
          "No money on the contract's balance."
        );
      });
    });

    describe("cashOut()", function () {
      it("should not allow a player to cash out if not enough money on the contract's balance.", async function () {
        await expect(roulette.cashOut()).to.be.revertedWith(
          "Not enough money on the contract's balance. Try again later."
        );
      });
    });

    describe("withdrawLink()", function () {
      it("should allow an owner to withdraw Link tokens", async function () {
        const tx = await roulette.withdrawLink({ gasLimit: 100000 });
        await tx.wait();
        expect(await link.balanceOf(roulette.address)).to.equal(0);
      });

      it("should allow only owner to withdraw Link tokens", async function () {
        await expect(roulette.connect(user2).withdrawLink()).to.be.revertedWith(
          "Not an owner."
        );
      });
    });

    describe("getBalances()", function () {
      it("should get balances correctly", async function () {
        const balances = await roulette.getBalances();
        const contractBalance = await ethers.provider.getBalance(
          roulette.address
        );
        expect(balances[0]).to.equal(contractBalance);
        //Winnings should be 0 after cashout()
        expect(balances[1]).to.equal(0);
      });
    });
  });
});
