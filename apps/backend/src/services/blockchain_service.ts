import app from "#config/app";
import {
  createPublicClient,
  createWalletClient,
  http,
  publicActions,
} from "viem";
import type { Address } from "viem";
import { avalancheFuji } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { CONTRACT_ABI } from "#lib/constant";

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

// Différer la création du wallet client jusqu'à ce qu'on en ait besoin
const getWalletClient = () => {
  const account = privateKeyToAccount(app.envs.PRIVATE_KEY as Address);
  return createWalletClient({
    chain: avalancheFuji,
    account,
    transport: http(),
  }).extend(publicActions);
};

// export const getMatchHistory = async (): Promise<MatchHistory[]> => {
//   const matchHistory = await client.readContract({
//     address: app.envs.CONTRACT_ADDRESS as `0x${string}`,
//     abi: CONTRACT_ABI,
//     functionName: "exploreHistory",
//   });

//   return matchHistory as MatchHistory[];
// };

const getUserMatchHistory = async (
  playerId: number
): Promise<MatchHistory[]> => {
  const userHistory = await client.readContract({
    address: app.envs.CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: "exploreUserHistory",
    args: [playerId],
  });
  return userHistory as MatchHistory[];
};

const storeMatchHistory = async (matchs: MatchHistory[]) => {
  const walletClient = getWalletClient();
  const { request } = await client.simulateContract({
    address: app.envs.CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: "storeScore",
    account: walletClient.account,
    args: matchs,
  });
  const tx = await walletClient.writeContract(request);
  return tx;
};

type MatchHistory = {
  player1_score: number;
  player2_score: number;
  player1_id: number;
  player2_id: number;
  tournamentId: number;
  matchId: number;
  date: string;
};

export default {
  getUserMatchHistory,
  storeMatchHistory,
};
