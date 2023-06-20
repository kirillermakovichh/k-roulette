// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";

contract Roulette is VRFV2WrapperConsumerBase {
    uint64 constant MAX_AMOUNT_ALLOWED_IN_THE_BANK = 1 ether;
    uint64 constant ENTRY_FEES = 0.001 ether;
    uint32 constant CALLBACK_GAS_LIMIT = 1000000;
    uint16 constant TIMER = 30;
    uint8 constant NUM_WORDS = 1;
    uint8 constant REQUEST_CONFIRMATIONS = 3;
    address constant LINK_ADDRESS = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address constant VRF_WRAPPER_ADDRESS =
        0xab18414CD93297B0d12ac29E63Ca20f515b3DB46;
    address public immutable owner;
    uint8[6] payouts;
    uint8[6] numberRange;
    uint256 public gamesCount;

    // BetTypes:
    //   0: color
    //   1: column
    //   2: dozen
    //   3: eighteen
    //   4: even/odd
    //   5: number

    // Value:
    //   color: 0 for black, 1 for red
    //   column: 0 for left, 1 for middle, 2 for right
    //   dozen: 0 for first, 1 for second, 2 for third
    //   eighteen: 0 for low, 1 for high
    //   even/odd: 0 for even, 1 for odd
    //   number: number

    struct Player {
        uint8 betType;
        uint8 number;
        bool isExists;
    }
    struct Game {
        uint256 startAt;
        bool started;
        bool isActive;
        bool fulfilled;
        uint256 paid;
    }

    mapping(address => Player) public players;
    address[] internal playersAddr;

    mapping(uint256 => Game) public games;

    mapping(address => uint256) internal winnings;

    event GameStarted(uint256 indexed gameId, uint256 startAt);
    event RandomNumber(uint256 indexed gameId, uint256 indexed number);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner.");
        _;
    }

    constructor()
        payable
        VRFV2WrapperConsumerBase(LINK_ADDRESS, VRF_WRAPPER_ADDRESS)
    {
        owner = msg.sender;
        payouts = [2, 3, 3, 2, 2, 36];
        numberRange = [1, 2, 2, 1, 1, 36];
    }

    function placeBet(uint8 _number, uint8 _betType) external payable {
        require(!players[msg.sender].isExists, "You can only place one bet.");
        require(msg.value == ENTRY_FEES, "Entry fees not sent.");
        require(
            _betType <= 5 && _number <= numberRange[_betType],
            "Incorrect bet type or value."
        );

        if (!games[gamesCount].started) {
            games[gamesCount] = Game({
                startAt: block.timestamp,
                started: true,
                isActive: false,
                fulfilled: false,
                paid: 0
            });
            emit GameStarted(gamesCount, block.timestamp);
        }

        require(
            games[gamesCount].startAt + TIMER > block.timestamp,
            "Timer expired. Wait for new game."
        );

        players[msg.sender] = Player({
            betType: _betType,
            number: _number,
            isExists: true
        });

        playersAddr.push(msg.sender);
    }

    function spin() external returns (uint256) {
        require(
            players[msg.sender].isExists || msg.sender == owner,
            "Only the player or owner can spin."
        );
        require(games[gamesCount].started, "Nobody in the game.");
        require(
            games[gamesCount].startAt + TIMER < block.timestamp,
            "Timer has not expired."
        );
        require(!games[gamesCount].isActive, "Game is active.");

        uint256 requestId = requestRandomness(
            CALLBACK_GAS_LIMIT,
            REQUEST_CONFIRMATIONS,
            NUM_WORDS
        );

        games[gamesCount].paid = VRF_V2_WRAPPER.calculateRequestPrice(
            CALLBACK_GAS_LIMIT
        );
        games[gamesCount].isActive = true;

        return requestId;
    }

    function fulfillRandomWords(
        uint256,
        uint256[] memory randomWords
    ) internal override {
        require(games[gamesCount].paid > 0, "Request not found.");

        games[gamesCount].fulfilled = true;
        uint8 number = uint8(randomWords[0] % 37);

        uint8 betType;
        uint8 value;
        //iterate over the players
        for (uint256 i = playersAddr.length; i > 0; i--) {
            address curAddr = playersAddr[i - 1];
            bool won = false;
            betType = players[curAddr].betType;
            value = players[curAddr].number;

            if (number == 0) {
                // bet on 0
                won = (betType == 5 && value == 0);
            } else {
                if (betType == 5) {
                    // bet on number
                    won = (value == number);
                } else if (betType == 4) {
                    // bet on even/odd
                    if (value == 0)
                        // bet on even
                        won = (number % 2 == 0);
                    if (value == 1)
                        // bet on odd
                        won = (number % 2 == 1);
                } else if (betType == 3) {
                    // bet on 18s
                    if (value == 0)
                        // bet on low 18s
                        won = (number <= 18);
                    if (value == 1)
                        // bet on high 18s
                        won = (number >= 19);
                } else if (betType == 2) {
                    // bet on dozen
                    if (value == 0)
                        // bet on 1st dozen
                        won = (number <= 12);
                    if (value == 1)
                        // bet on 2nd dozen
                        won = (number > 12 && number <= 24);
                    if (value == 2)
                        // bet on 3rd dozen
                        won = (number > 24);
                } else if (betType == 1) {
                    // bet on column
                    if (value == 0)
                        // bet on left column
                        won = (number % 3 == 1);
                    if (value == 1)
                        // bet on middle column
                        won = (number % 3 == 2);
                    if (value == 2)
                        // bet on right column
                        won = (number % 3 == 0);
                } else if (betType == 0) {
                    // bet on color
                    if (value == 0) {
                        /* bet on black */
                        if (number <= 10 || (number >= 20 && number <= 28)) {
                            won = (number % 2 == 0);
                        } else {
                            won = (number % 2 == 1);
                        }
                    } else {
                        /* bet on red */
                        if (number <= 10 || (number >= 20 && number <= 28)) {
                            won = (number % 2 == 1);
                        } else {
                            won = (number % 2 == 0);
                        }
                    }
                }
            }

            if (won) {
                winnings[curAddr] += ENTRY_FEES * payouts[betType];
            }
            players[curAddr] = Player({betType: 0, number: 0, isExists: false});
            playersAddr.pop();
        }
        emit RandomNumber(gamesCount, number);
        gamesCount++;
    }

    function cashOut() external {
        uint256 amount = winnings[msg.sender];
        require(
            amount < address(this).balance,
            "Not enough money on the contract's balance. Try again later."
        );
        require(amount > 0, "You have no winnings.");
        winnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function safeWithdraw() external onlyOwner {
        require(
            address(this).balance > MAX_AMOUNT_ALLOWED_IN_THE_BANK,
            "Not enough money to safe withdraw."
        );

        uint256 amount = address(this).balance - MAX_AMOUNT_ALLOWED_IN_THE_BANK;
        if (amount > 0) payable(owner).transfer(amount);
    }

    function allWithdraw() external onlyOwner {
        require(
            address(this).balance > 0,
            "No money on the contract's balance."
        );
        payable(owner).transfer(address(this).balance);
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(LINK_ADDRESS);
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer."
        );
    }

    function getBalances() public view returns (uint256, uint256) {
        return (address(this).balance, winnings[msg.sender]);
    }

    receive() external payable {}
}
