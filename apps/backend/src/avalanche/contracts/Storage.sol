// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Storage {
	address private	_backend;
	uint64			TOTALMATCH = 0;

	constructor() {
		_backend = msg.sender;
	}

	struct Game {
		uint8		player1_score;
		uint8		player2_score;
		uint64		player1_id;
		uint64		player2_id;
		uint64		tournamentId;
	}

	modifier onlyBackend() {
		require(msg.sender == _backend, "You cannot modify scores.");
		_;
	}


	mapping(uint64 => Game) private matchHistory;

	function storeScore(uint64 tournamentId, uint64[] calldata matchIdArray, uint8[] calldata player1ScoreArray, uint8[] calldata player2ScoreArray, uint64[] calldata player1IdArray, uint64[] calldata player2IdArray) external onlyBackend() {
		uint64 addedMatch = 0;
		for (uint16 i = 0; i < matchIdArray.length; i++) {
			matchHistory[TOTALMATCH + i] = Game(player1ScoreArray[i], player2ScoreArray[i], player1IdArray[i], player2IdArray[i], tournamentId);
			addedMatch++;
		}
		TOTALMATCH += addedMatch;
	}

	function exploreHistory() external view returns (Game[] memory) {
		Game[] memory history = new Game[](TOTALMATCH);

		for (uint64 i = 0; i < TOTALMATCH; i++) {
			history[i] = matchHistory[i];
		}
		return history;
	}



	// function explorePlayerHistory(uint128 depth, uint64 playerId) external view returns (Game[] memory) {
	// 	Game[] memory playerGames = new Game[] (depth);
	// 	uint128 gamesToStore = depth;

	// 	for (uint128 i = lastestMatch; i > 0 && gamesToStore > 0; i--) {
	// 		if (matchHistory[i - 1].player1_id == playerId || matchHistory[i - 1].player2_id == playerId) {
	// 			playerGames[depth - gamesToStore] = matchHistory[i - 1];
	// 			gamesToStore--;
	// 		}
	// 	}
	// 	return playerGames;
	// }
}

