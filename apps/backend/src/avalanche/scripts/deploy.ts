import { ethers } from "ethers";
import * as dotenv from "dotenv";
import contractArtifact from "../artifacts/contracts/Storage.sol/Storage.json";

dotenv.config();

const owner = process.env.OWNER;

const main = async () => {
	const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

	const factory = new ethers.ContractFactory(
		contractArtifact.abi,
		contractArtifact.bytecode,
		wallet
	);

	const contract = await factory.deploy(owner);
	console.log("Deployment in progress...");
	await contract.waitForDeployment();

	console.log("Contract deployed at:", contract.target);
};

main().catch((err) => {
	console.error("Error deploying contract:", err.message);
	process.exit(1);
});
