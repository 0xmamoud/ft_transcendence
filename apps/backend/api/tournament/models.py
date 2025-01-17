from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class TournamentStatus:
    PENDING = "PENDING"
    READY = "READY"
    IN_PROGRESS = "IN_PROGRESS"
    FINISHED = "FINISHED"

    CHOICES = [
        (PENDING, "Pending"),
        (READY, "Ready"),
        (IN_PROGRESS, "In Progress"),
        (FINISHED, "Finished"),
    ]


class MatchStatus:
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    FINISHED = "FINISHED"

    CHOICES = [
        (PENDING, "Pending"),
        (IN_PROGRESS, "In Progress"),
        (FINISHED, "Finished"),
    ]


class Tournament(models.Model):
    name = models.CharField(max_length=100)
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tournament_creator",
        verbose_name="creator",
    )
    winner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tournament_winner",
        verbose_name="winner",
    )
    status = models.CharField(
        max_length=20,
        choices=TournamentStatus.CHOICES,
        default=TournamentStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        verbose_name = "Tournament"
        verbose_name_plural = "Tournaments"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Match(models.Model):

    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="matches",
        verbose_name="tournament",
    )
    player1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="player1",
        verbose_name="player1",
    )
    player2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="player2",
        verbose_name="player2",
    )
    winner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="winner",
        verbose_name="winner",
    )
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=MatchStatus.CHOICES,
        default=MatchStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        verbose_name = "Match"
        verbose_name_plural = "Matches"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.player1} vs {self.player2}"


class Participant(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="participants",
        verbose_name="tournament",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="participants",
        verbose_name="user",
    )
    username = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        verbose_name = "Participant"
        verbose_name_plural = "Participants"
        ordering = ["-created_at"]

    def __str__(self):
        return self.username


# Create your models here.
