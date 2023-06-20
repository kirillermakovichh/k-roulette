import { createContext, useContext, useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { Web3Provider } from "@ethersproject/providers";

const SignerContext = createContext();

const useSigner = () => useContext(SignerContext);

export const SignerProvider = ({ children }) => {
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", connectWallet);
    } else {
      return alert("PLEASE install metamask!");
    }
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      const web3modal = new Web3Modal();
      const instance = await web3modal.connect();
      const provider = new Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setSigner(signer);
      setAddress(address);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert("Install metamask<3");

    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length) {
      connectWallet();
    } else {
      console.log("No acc found");
    }
  };

  const contextValue = { signer, account, address, loading, connectWallet };

  return (
    <SignerContext.Provider value={contextValue}>
      {children}
    </SignerContext.Provider>
  );
};

export default useSigner;
