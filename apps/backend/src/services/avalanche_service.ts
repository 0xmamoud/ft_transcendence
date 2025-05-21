import fastify from "fastify"
import { ethers } from "ethers"
import * as dotenv from "dotenv"

import artifact from "#avalanche/artifacts/contracts/Storage.sol/Storage.json"
import {Game, GameType} from "#avalanche/Interface/IStorage"


dotenv.config()

let provider: ethers.BrowserProvider;

const ProviderInit = async () => {
	if (window.ethereum) {
		provider = new ethers.BrowserProvider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
	} else {
		console.log("@metaMask/Providers should be installed. Check package.json dependencies");
	}
};

const Signer = async (): Promise<ethers.Signer> => {
	await ProviderInit();
	if (!provider) {
	  throw new Error("Provider is not initialized.");
	}
	const signer = await provider.getSigner();
	return signer;
};

const createContractInstance = async (): Promise<ethers.Contract> => {
	const contract = new ethers.Contract(process.env.ADDRESS!, artifact.abi, await Signer())
	return contract
}

const getGlobalHistory = async () : Promise<Game[]> => {
	const contract = await createContractInstance()
	const games : Game[] = await contract.methods.exploreHistory()
	return games
}

// const explorePlayerHistory = async (depth: number, id: number) : Promise<Game[]> => {
// 	const contract = await createContractInstance()
// 	const games: Game[] = await contract.methods.explorePlayerHistory(depth, id)
// 	return games
// }

const storeScore = async (tournamentId: number, matchIdArray: number[], player1ScoreArray: number[], player2ScoreArray: number[], player1IdArray: number[], player2IdArray: number[]): Promise<number> => {
	const contract = await createContractInstance()
	const tx = await contract.methods.storeScore(tournamentId, matchIdArray, player1ScoreArray, player2ScoreArray, player1IdArray, player2IdArray)
	const confirm = await tx.wait();

	return confirm.status
}

export default {
	ProviderInit,
	getGlobalHistory,
	// explorePlayerHistory,
	storeScore
}