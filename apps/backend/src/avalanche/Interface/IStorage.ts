export	enum GameType {
	ia = "ia",
	casual = "casual",
	tournament = "tournament"
}

export	interface Game {
	player1_score	: number;
	player2_score	: number;
	player1_id		: number;
	player2_id		: number;
	tournamentId	: number;
}