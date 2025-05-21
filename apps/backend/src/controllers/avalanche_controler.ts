import type { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";

import {Game, GameType} from "#avalanche/Interface/IStorage.js"
import avalanche_service from "#services/avalanche_service.js"
import {Match, MatchModel} from "#types/matches.type"

// voir pour que le front envoie la data depth correspondant au nombre de game qu'on veut afficher. 
const getGlobalHistory =  async (req: FastifyRequest, reply: FastifyReply) : Promise<Game[]> => {
	try {
		const gamesHistory: Game[] = await avalanche_service.getGlobalHistory()
		return gamesHistory.map(game => ( {
			player1_score:	Number(game.player1_score),
			player2_score:	Number(game.player2_score),
			player1_id:		Number(game.player1_id),
			player2_id:		Number(game.player2_id),
			tournamentId:	Number(game.tournamentId),
		})) /*as Game[]*/;
	}
	catch (error) {
		return reply.status(500).send({message: "Impossible to display history for now, verify blockchain state or try later."})
	}
}

// userId en string?
// const explorePlayerHistory = async (req: FastifyRequest<{ Params: { depth: number; userId: string } }>, reply: FastifyReply) : Promise<Game[]> => {
// 	try {
// 		const { depth, userId } = req.params;
// 		const user = parseInt(userId);
		
// 		if (isNaN(depth)) {
// 			return reply.status(400).send({ error: "Must choose moree than 0 game" });
// 		}
// 		if (isNaN(user)) {
// 			return reply.status(400).send({ error: "Invalid user IDs" });
// 		}
// 		const gamesHistory: Game[] = await avalanche_service.explorePlayerHistory(depth, user)
// 		return gamesHistory.map(game => ( {
// 			player1_score:	Number(game.player1_score),
// 			player2_score:	Number(game.player2_score),
// 			player1_id:		Number(game.player1_id),
// 			player2_id:		Number(game.player2_id),
// 			tournamentId:	Number(game.tournamentId),
// 		}))
// 	}
// 	catch (error) {
// 		return reply.status(500).send({message: "Impossible to display history for now, verify user and blockchain state or try later."})
// 	}
// }

const seriliazeTournament = async (tournamentId: number) : Promise<{
	matchIdArray: number[],
	player1ScoreArray: number[],
	player2ScoreArray: number[],
	player1IdArray: number[],
	player2IdArray: number[] 
	}> => {
	const allMatchTournamentObject: MatchModel[] = await FastifyInstance.db.tournament.findMany({
		where: {tournamentId: tournamentId},
	})
	const serializedMatches: Match[] = allMatchTournamentObject.map((match: MatchModel): Match => ({
		tournamentId:	match.tournamentId,
		matchId:		match.id,
		player1Score:	match.player1Score,
		player2Score:	match.player2Score,
		player1Id:		match.player1Id,
		player2Id:		match.player2Id,
	}));

	const matchIdArray			: number[] = [];
	const player1ScoreArray		: number[] = [];
	const player2ScoreArray		: number[] = [];
	const player1IdArray		: number[] = [];
	const player2IdArray		: number[] = [];
	for (const match of serializedMatches) {
		matchIdArray.push(match.matchId)
		player1ScoreArray.push(match.player1Score)
		player2ScoreArray.push(match.player2Score)
		player1IdArray.push(match.player1Id)
		player2IdArray.push(match.player2Id)
	}
	return {matchIdArray, player1ScoreArray, player2ScoreArray, player1IdArray, player2IdArray}
}

const storeScore = async (req: FastifyRequest<{ Params: {tournamentId: number} }>, reply: FastifyReply) => {
	const { matchIdArray, player1ScoreArray, player2ScoreArray, player1IdArray, player2IdArray} = await seriliazeTournament(req.body.tournamentId)
	try {
		const tx: number = await avalanche_service.storeScore(req.tournamentId, matchIdArray, player1ScoreArray, player2ScoreArray, player1IdArray, player2IdArray)
		if (tx == 0) {
			return reply.status(500).send({message: "Failed to write on blockchain. Check if wallet sold is enought for gas fees"})
		}
		return reply.status(200).send({message: "Score succesfully stored on blockchain"})
	}
	catch (error) {
		return reply.status(500).send({message: "Failed store score"})
	}
}

const askToBlockchainStorage = async (req: FastifyRequest, reply: FastifyReply) => {
	reply.send({message: "Do you want to save score on blockchain?"});
}

// const autoriseWallet = async (req:FastifyRequest, reply: FastifyReply) => {
// 	try {
// 		await avalanche_service.ProviderInit();
// 	}
// 	catch (error) {
// 		reply.status(500).send({message: "Error when trying to connect user wallet. Check your metamask version"})
// 	}
// }

export default {
	getGlobalHistory,
	// explorePlayerHistory,
	storeScore,
	askToBlockchainStorage,
	// autoriseWallet
}