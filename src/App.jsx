import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';
import entesNft from './utils/EntesNFT.json';

// Moved the contract address to the top for easy access.
//const CONTRACT_ADDRESS = "0xBFfb4cD3a8eE4BF71E4ebf07C891bA4458D2551a"; COMMENTED FOR ENTES TEST
const CONTRACT_ADDRESS = "0x4f5239B11484505dCB367a4897FC9e411a1dc12d"

const App = () => {

  // Just a state variable we use to store our user's public wallet.
  // Don't forget to import useState
  const [currentAccount, setCurrentAccount] = useState("");

  // Make sure this is async
  const checkIfWalletIsConnected = async () => {
    // First make sure we have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({method: 'eth_accounts'});

    // User can have multiple authorized accounts, we grab the first one if its there!

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  }

  // Implement your connectWallet method here
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // Fancy method to request access to account
      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      // Boom! This should print out public address once we authorize Metamask.
      console.log("Connected!", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time
      setupEventListener();
    } catch (error) {
      console.log(error);
    }

    // Leting users know that we are on Rinkeby chain
    let chainId = await ethereum.request({method: 'eth_chainId'});
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkeby test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network");
    }
  }

  // Setup our listener
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer); COMMENTED FOR ENTES TESTS
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, entesNft.abi, signer);

        // THIS IS THE MAGIC SAUCE
        // This will essentially "caputre" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        //connectedContract.on("NewEpicNFTMinted", (from, tokenId) => { COMMENTED FOR ENTES TESTS
        connectedContract.on("NewEntesNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer); COMMENTED FOR ENTES TESTS
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, entesNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...");
        //let nftTxn = await connectedContract.makeAnEpicNFT(); COMMENTED FOR ENTES TESTS
        let nftTxn = await connectedContract.mintEntesNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethreum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const revealCollection = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, entesNft.abi, signer);

        console.log("Going to pop wallet to pay gas...");
        let revealTxn = await connectedContract.setRevealed(true);

        console.log("Mining...please wait.");
        await revealTxn.wait();

        console.log(`Colelction revealed, see transaction: https://rinkeby.etherscan.io/tx/${revealTxn.hash}`);
      } else {
        console.log("Ethereum doesnt exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Get total minted so far
  const getTotalNFTMintedSoFar = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer); COMMENTED FOR ENTES TESTS
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, entesNft.abi, signer);

        const totalMinted = await connectedContract.getTotalNFTsMintedSoFar();
        console.log(totalMinted.toString())
        document.getElementById('soFarMinted').innerText = totalMinted.toString() + " NFTs minted so Far";
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch(error) {
      console.log(error);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  // This runs our function when the page loads
  useEffect(
    () => {
      checkIfWalletIsConnected();
      getTotalNFTMintedSoFar();
    }, []
  )

  // Added a conditional render! We don't want to show Connect to Wallet if we're already connected :).
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            Mint NFT
            </button>
          )}
          <p id="soFarMinted" className="sub-text">
            Minted so far 0
          </p>
          <p className="footer-text">See our collection on <a href="https://testnets.opensea.io/assets/squarenft-nuj4dv0eqr" target="_blank">OpenSea</a> </p>
          <button onClick={revealCollection} className="cta-button connect-wallet-button">
            Reveal collection
            </button>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;