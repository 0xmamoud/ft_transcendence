from .models import Tournament, Participant, TournamentStatus
from .match_service import MatchService


class TournamentService:

    def create_tournament(self, name, user, username=None):
        """
        Creates a new tournament and adds the creator as a participant.
        """
        tournament = Tournament.objects.create(name=name, creator=user)

        Participant.objects.create(
            tournament=tournament,
            user=user,
            username=username,
        )

        return tournament

    def join_tournament(self, tournament_id, user, username=None):
        """
        Allows a user to join a tournament if it's pending and not full.
        """
        tournament = Tournament.objects.get(id=tournament_id)

        if tournament.status != TournamentStatus.PENDING:
            raise ValueError("Tournament is not accepting participants")

        if tournament.participants.filter(user=user).exists():
            raise ValueError("User already in tournament")

        Participant.objects.create(
            tournament=tournament,
            user=user,
            username=username,
        )

    def start_tournament(self, tournament_id, user):
        """
        Starts the tournament by creating matches if the user is the creator.
        """
        tournament = Tournament.objects.get(id=tournament_id)

        if tournament.creator != user:
            raise ValueError("User is not the creator of the tournament")

        if tournament.status != TournamentStatus.PENDING:
            raise ValueError("Tournament is not pending")

        if tournament.participants.count() < 2:
            raise ValueError("Not enough participants to start the tournament")

        tournament.status = TournamentStatus.IN_PROGRESS
        tournament.save()

        match_service = MatchService()
        matches = match_service.create_matches(tournament)
        return matches

    def finish_tournament(self, tournament_id):
        """
        Finishes the tournament by updating the status.
        """
        tournament = Tournament.objects.get(id=tournament_id)

        if tournament.status != TournamentStatus.IN_PROGRESS:
            raise ValueError("Tournament is not in progress")

        tournament.status = TournamentStatus.FINISHED
        tournament.save()
