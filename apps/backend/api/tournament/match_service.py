from .models import Tournament, Match, User, MatchStatus


class MatchService:
    def create_matches(self, tournament):
        """
        Creates matches for a tournament in a round-robin format.
        """
        participants = list(tournament.participants.all())
        matches = []

        for i in range(len(participants)):
            for j in range(i + 1, len(participants)):
                match = Match.objects.create(
                    tournament=tournament,
                    player1=participants[i].user,
                    player2=participants[j].user,
                )
                matches.append(match)

        return matches

    def complete_match(self, match_id, winner_id, player1_score, player2_score):
        """
        Completes a match by updating the winner and status.
        """
        match = Match.objects.get(id=match_id)
        winner = User.objects.get(id=winner_id)

        if match.status != MatchStatus.IN_PROGRESS:
            raise ValueError("Match is not in progress")

        match.winner_id = winner
        match.player1_score = player1_score
        match.player2_score = player2_score
        match.status = MatchStatus.FINISHED
        match.save()

    def next_match(self, tournament_id):
        """
        Returns the next match to be played in the tournament.
        """
        tournament = Tournament.objects.get(id=tournament_id)
        match = tournament.matches.filter(status=MatchStatus.PENDING).first()

        if match is None:
            raise ValueError("No more matches to play")

        match.status = MatchStatus.IN_PROGRESS

        return match
