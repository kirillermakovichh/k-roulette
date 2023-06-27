import useRoulette from "@/state";
import useBets from "@/state/useBets";
import useSigner from "@/state/signer";
import BetForm from "@/components/BetForm";
import useCountdown from "@/components/useCountdown";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Roulette from "../../utils/Roulette.json";
import swal from "sweetalert";
import { ClipLoader } from "react-spinners";

const HomePage = () => {
  const [betPopupOpen, setBetPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countDown, setCountdown] = useState(false);
  const [winNumber, setWinNumber] = useState();
  const [playerChoice, setPlayerChoice] = useState(new Object());

  //COUNTDOWN
  const [timeLeft, setEndTime] = useCountdown(new Date().getTime());
  const minutes = Math.floor(timeLeft / 60000) % 60;
  const seconds = Math.floor(timeLeft / 1000) % 60;

  const { signer } = useSigner();
  const { numbers } = useBets();
  const { bet, spin, getBalances, cashOut, balances } = useRoulette();
  const ROULETTE_ADDRESS = process.env.NEXT_PUBLIC_ROULLETE_ADDRESS;

  const getWinNumber = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const rouletteContract = new ethers.Contract(
      ROULETTE_ADDRESS,
      Roulette.abi,
      provider
    );

    rouletteContract.on("RandomNumber", (gameId, number) => {
      setLoading(false);
      setCountdown(false);
      let el = {};
      var id = Object.keys(number).map(function (key) {
        return number[key];
      });
      el = Number(id[0]);
      setWinNumber(el);

      if (playerChoice.signer) {
        let value = Number(playerChoice.signer[0]);
        let betType = playerChoice.signer[1];
        checkChoice(value, betType, el);
      }
    });
  };

  const checkChoice = (value, betType, el) => {
    let won = false;
    if (el == 0) {
      won = betType == 5 && value == 0;
    } else {
      if (betType == 5) {
        won = value == el;
      } else if (betType == 4) {
        if (value == 0) won = el % 2 == 0;
        if (value == 1) won = el % 2 == 1;
      } else if (betType == 3) {
        if (value == 0) won = el <= 18;
        if (value == 1) won = el >= 19;
      } else if (betType == 2) {
        if (value == 0) won = el <= 12;
        if (value == 1) won = el > 12 && el <= 24;
        if (value == 2) won = el > 24;
      } else if (betType == 1) {
        if (value == 0) won = el % 3 == 1;
        if (value == 1) won = el % 3 == 2;
        if (value == 2) won = el % 3 == 0;
      } else if (betType == 0) {
        if (value == 0) {
          if (el <= 10 || (el >= 20 && el <= 28)) {
            won = el % 2 == 0;
          } else {
            won = el % 2 == 1;
          }
        } else {
          if (el <= 10 || (el >= 20 && el <= 28)) {
            won = el % 2 == 1;
          } else {
            won = el % 2 == 0;
          }
        }
      }
    }
    if (won) {
      swal({
        position: "center",
        icon: "success",
        title: "You win!!!",
        text: `Value:${value} - Bet Type:${betType + 1}.`,
        showConfirmButton: false,
        timer: 5000,
      });
    } else {
      swal({
        position: "center",
        title: "You lose.",
        text: `Value:${value} - Bet Type:${betType + 1}.`,
        showConfirmButton: false,
        timer: 5000,
      });
    }
  };

  const onButtonClick = async () => {
    setBetPopupOpen(true);
  };

  const Bet = async (_number, _betType) => {
    try {
      setPlayerChoice((playerChoice.signer = [_number, _betType]));
      setBetPopupOpen(false);
      await bet(_number, _betType);
      if(timeLeft == 0){
        const endTime = new Date().getTime() + 40000; // 40 seconds
        setEndTime(endTime);
        setCountdown(true);
      }
      await new Promise((resolve) => setTimeout(resolve, 40000));
      Spin();
    } catch (e) {
      console.log(e);
    }
  };
  const Spin = async () => {
    try {
      setCountdown(false);
      setLoading(true);
      await spin();
    } catch (e) {
      console.log(e);
    }
  };

  const GetBalance = async () => {
    try {
      await getBalances();
      swal({
        title: "INFO",
        text: `Contract balance: ${
          balances[0][0] / 10 ** 18
        } ETH.\nYour balance: ${balances[0][1] / 10 ** 18} ETH.`,
        icon: "info",
      });
    } catch (e) {
      console.log(e);
    }
  };

  const Cashout = async () => {
    try {
      await getBalances();
      if (balances[0][1] == 0) {
        swal({
          title: "Your balance is 0.",
          icon: "warning",
        });
      } else {
        setLoading(true);
        await cashOut();
        balances[0][1] = 0;
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getWinNumber();
  }, [winNumber]);

  const numbersArr1 = [12, 14, 16, 18, 30, 32, 34, 36];
  const numbersArr2 = [11, 13, 15, 17, 29, 31, 33, 35];

  // const onLoading = async () => {
  //   setLoading(!loading);
  // };
  // const onCountDown = async () => {
  //   setCountdown(!countDown);
  // };

  return (
    <div className="w-full flex-col px-2">
      {/* <button onClick={onLoading}>Loading</button>
      <button onClick={onCountDown}>Countdown</button> */}
      <BetForm
        open={betPopupOpen}
        onClose={() => setBetPopupOpen(false)}
        onSubmit={Bet}
      />
      {signer && (
        <div className="md:flex-col flex items-center justify-center pt-4 pb-20 md:pb-8">
          <div className="shrink grow flex-col justify-items-center items-center h-[152px] py-2">
            {numbers && (
              <div className="text-center">
                <span
                  className={`p-2 text-xl text-white font-semibold rounded-md cursor-default 
                  ${
                    (winNumber ? winNumber : numbers[numbers.length - 1]) == 0
                      ? "bg-green-500"
                      : "bg-black"
                  }
                  ${
                    numbersArr1.includes(
                      winNumber ? winNumber : numbers[numbers.length - 1]
                    )
                      ? "bg-red-500"
                      : "bg-black"
                  }
                  ${
                    numbersArr2.includes(
                      winNumber ? winNumber : numbers[numbers.length - 1]
                    ) ||
                    (winNumber ? winNumber : numbers[numbers.length - 1]) % 2 ==
                      0
                      ? "bg-black"
                      : "bg-red-500"
                  }
                `}
                >
                  LAST WIN NUMBER:{" "}
                  {winNumber ? winNumber : numbers[numbers.length - 1]}
                </span>
              </div>
            )}
            {countDown && (
              <div className="flex items-center justify-center">
                <div className="bg-white flex items-center justify-center text-center my-4 font-bold text-3xl rounded-md h-[100px] max-w-[224px]">
                  <span className="">{`GAME STARTS IN ${minutes}:${seconds}`}</span>
                </div>
              </div>
            )}
            {loading && (
              <div>
                <div className="text-center pt-6">
                  <ClipLoader
                    color="#ff0000"
                    size={100}
                    className="flex"
                    cssOverride={{}}
                  />
                </div>
                <p className="pt-4 text-white text-center">1 MINUTE...</p>
              </div>
            )}
          </div>
          <div className="shrink grow max-w-[150px] mx-auto md:mt-16 md:max-w-[100px] ">
            <button
              className={`ml-auto rounded-md flex h-[150px] w-[150px] items-center justify-center bg-[#3bba33] text-2xl font-semibold text-white hover:bg-transparent border-2 border-[#3bba33] ease-linear duration-150 
               md:text-xl md:w-[100px] md:max-h-[100px] md:mb-4 `}
              onClick={onButtonClick}
              disabled={loading}
            >
              <span>
                PLACE
                <br />
                YOUR BET
              </span>
            </button>
          </div>
          <div className="shrink grow flex-column items-center justify-center">
            <button
              className={`px-[10px] mb-6 mx-auto rounded-md group flex h-16 items-center justify-center bg-black text-2xl font-semibold text-white hover:bg-transparent border-2 border-black ease-linear duration-150`}
              onClick={GetBalance}
              disabled={loading}
            >
              <span>CHECK BALANCE</span>
            </button>
            <button
              className={`px-[10px] w-[209px] mx-auto rounded-md group flex h-16 items-center justify-center bg-red-500 text-2xl font-semibold text-white hover:bg-transparent border-2 border-red-500 ease-linear duration-150`}
              onClick={Cashout}
              disabled={loading}
            >
              <span>CASHOUT</span>
            </button>
          </div>
        </div>
      )}
      {!signer && (
        <p className="-mt-10 pt-12 pb-8 text-white text-center font-semibold">
          Connect your wallet please...
        </p>
      )}
      <div className=" flex justify-center items-center px-8 md:flex-col">
        <div className="flex-1 flex justify-center items-center md:mb-4">
          <img
            className="max-h-[400px] max-w-[400px] object-cover rounded-md mx-2 lg:max-h-[300px] lg:max-w-[300px]"
            src="https://sun9-37.userapi.com/impg/R8se7OYLyL7cdv8Pz1WN7BLGj5z3TLOqOsVj1A/K5qlaAEAPFY.jpg?size=600x600&quality=96&sign=cad8252f497dc76945d1dce6ef61d865&type=album"
            alt="desk"
          />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img
            className="max-h-[400px] max-w-[400px] object-cover rounded-md mx-2 lg:max-h-[300px] lg:max-w-[300px]"
            src="https://sun9-78.userapi.com/impg/fnTrMqN8cIfpHa9-eopFnN6Kt4lU1sjS8SIe9Q/obDY7HZB33w.jpg?size=833x833&quality=96&sign=01f7856a9f622a93c14921ab08457621&type=album"
            alt="rules"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
