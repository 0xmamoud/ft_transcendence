// import { ethers } from "hardhat";
import ethers  from "ethers";
import {Contract, Wallet, JsonRpcProvider } from "ethers"; // pas ethers.providers !
import * as dotenv from "dotenv"
import contractJson from "../artifacts/contracts/Storage.sol/Storage.json";
import {Game} from "#avalanche/Interface/IStorage.js"


dotenv.config()

const provider = new JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");

const privateKey = process.env.PRIVATE_KEY; 
const wallet = new Wallet(privateKey, provider);

const contractAddress = process.env.ADDRESS;

const contractABI = contractJson.abi;

const contract = new Contract(contractAddress, contractABI, wallet);

const matchIdArray=       [1, 1, 1 ,1];
const player1ScoreArray = [3, 4, 5, 2];
const player2ScoreArray = [5, 5, 0, 5];
const player1IdArray =    [1, 3, 2, 4];
const player2IdArray =    [2, 4, 4, 1];

			
async function main() {
  const value = await contract.storeScore(1 , matchIdArray, player1ScoreArray, player2ScoreArray, player1IdArray, player2IdArray);
  console.log("Transaction envoyée");

  console.log("Affichage");
  const history = await contract.exploreHistory() as Game;

  console.log(history)
}

main().catch(console.error);

// async function main() {
//   const provider = ethers.provider;
//   const blockNumber = await provider.getBlockNumber();
//   console.log("Bloc actuel sur Fuji :", blockNumber);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });