import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Roulette from "../utils/Roulette.json";

const useBets = () => {
  const [randomNumbersArr, setRandomNubersArr] = useState([]);

  const queryHistoricalEvents = async () => {
    const ROULETTE_ADDRESS = process.env.NEXT_PUBLIC_ROULLETE_ADDRESS;

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const rouletteContract = new ethers.Contract(
      ROULETTE_ADDRESS,
      Roulette.abi,
      provider
    );

    const filterRandomNumber = rouletteContract.filters.RandomNumber(
      null,
      null
    );

    const randomNuber = await rouletteContract.queryFilter(
      filterRandomNumber,
      3529255,
      4529255
    );

    let randomNumbers = [];

    for (let i = 0; i < randomNuber.length; i++) {
      let element = randomNuber[i];
      let elNewArr = {};
      var id = Object.keys(element.args.number).map(function (key) {
        return element.args.number[key];
      });
      elNewArr = Number(id[0]);
      randomNumbers.push(elNewArr);
    }
    setRandomNubersArr((oldState) => [...oldState, randomNumbers]);
  };

  const numbers = randomNumbersArr[0];

  useEffect(() => {
    queryHistoricalEvents();
  }, []);

  return { numbers };
};

export default useBets;
