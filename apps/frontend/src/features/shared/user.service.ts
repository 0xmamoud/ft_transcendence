import { UserProfile, UserPublicProfile } from "@/features/shared/type";

export interface MatchHistoryStats {
  totalMatches: number;
  wonMatches: number;
  winRate: string;
}

export interface MatchHistoryItem {
  id: number;
  opponentName: string;
  opponentAvatar: string | null;
  opponentId: number;
  userScore: number;
  opponentScore: number;
  won: boolean;
  status: string;
  date: string;
}

export interface MatchHistory {
  userId: number;
  username: string;
  matches: MatchHistoryItem[];
  stats: MatchHistoryStats;
}

export class UserService {
  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch("/api/users/me");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user profile");
    }

    return data as UserProfile;
  }

  async getUserPublicProfile(userId: string): Promise<UserPublicProfile> {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user public profile");
    }

    return data as UserPublicProfile;
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    // Si l'avatar est un File, utiliser FormData
    if (data.avatar instanceof File) {
      const formData = new FormData();
      formData.append("username", data.username || "");
      formData.append("email", data.email || "");
      formData.append("avatar", data.avatar);

      const response = await fetch("/api/users/me", {
        method: "PUT",
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update profile");
      }
      return responseData as UserProfile;
    }

    // Sinon, envoyer en JSON normal
    const response = await fetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update profile");
    }
    return responseData as UserProfile;
  }

  async getUserMatchHistory(): Promise<MatchHistory> {
    const response = await fetch("/api/users/me/match-history", {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch match history");
    }

    return data as MatchHistory;
  }
}

export const userService = new UserService();
