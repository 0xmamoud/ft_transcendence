import {
  CreateTournamentDto,
  JoinTournamentDto,
  ITournamentService,
} from "@/features/play/types";

class TournamentService implements ITournamentService {
  async createTournament(data: CreateTournamentDto) {
    const url = new URL("/api/tournaments/create", window.location.origin);
    if (data.maxParticipants) {
      url.searchParams.append(
        "maxParticipants",
        data.maxParticipants.toString()
      );
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        username: data.creatorUsername,
      }),
      credentials: "include",
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to create tournament: ${responseData.message}`);
    }

    return responseData;
  }

  async getTournament(id: number) {
    const response = await fetch(`/api/tournaments/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to get tournament: ${responseData.message}`);
    }

    return responseData;
  }

  async joinTournament(id: number, data?: JoinTournamentDto) {
    const response = await fetch(`/api/tournaments/join/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data || {}),
      credentials: "include",
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to join tournament: ${responseData.message}`);
    }

    return responseData;
  }

  async startTournament(id: number) {
    const response = await fetch(`/api/tournaments/start/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to start tournament: ${responseData.message}`);
    }

    return responseData;
  }

  async getTournamentParticipants(id: number) {
    const response = await fetch(`/api/tournaments/${id}/participants`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to get tournament participants: ${responseData.message}`
      );
    }

    return responseData;
  }

  async getTournamentMatches(id: number) {
    const response = await fetch(`/api/tournaments/${id}/matches`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to get tournament matches: ${responseData.message}`
      );
    }

    return responseData;
  }
}

export const tournamentService = new TournamentService();
