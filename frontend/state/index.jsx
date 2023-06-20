import { Contract, ethers } from "ethers";
import Roulette from "../utils/Roulette.json";
import useSigner from "./signer";
import { useState } from "react";

const ROULETTE_ADDRESS = process.env.NEXT_PUBLIC_ROULLETE_ADDRESS;

const useRoulette = () => {
  const [balances, setBalances] = useState([]);
  const { signer } = useSigner();
  const rouletteContract = new Contract(ROULETTE_ADDRESS, Roulette.abi, signer);

  const bet = async (_number, _betType) => {
    try {
      const transaction = await rouletteContract.placeBet(_number, _betType, {
        value: ethers.utils.parseEther("0.001"),
        gasLimit: 1000000,
      });
      await transaction.wait(1);
    } catch (error) {
      console.log(error);
    }
  };
  const spin = async () => {
    try {
      const transaction = await rouletteContract.spin({
        gasLimit: 1000000,
      });
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const cashOut = async () => {
    try {
      const transaction = await rouletteContract.cashOut();
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  };
  const getBalances = async () => {
    const transaction = await rouletteContract.getBalances();
    let balancesToShow = [];
    for (let i = 0; i < transaction.length; i++) {
      const element = transaction[i];
      let elNewArr;
      var id = Object.keys(element).map(function (key) {
        return element[key];
      });
      elNewArr = Number(id[0]);
      balancesToShow.push(elNewArr.toString());
    }
    setBalances((oldState) => [...oldState, balancesToShow]);
  };

  return { bet, spin, cashOut, getBalances, balances };
};

export default useRoulette;
