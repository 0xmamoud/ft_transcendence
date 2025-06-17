export interface Friend {
  id: number;
  username: string;
  avatar: string;
  isOnline: boolean;
}

interface FriendServiceInterface {
  getFriendsList: () => Promise<Friend[]>;
  deleteFriend: (friendId: number) => Promise<void>;
  addFriend: (username: string) => Promise<void>;
}

export class FriendService implements FriendServiceInterface {
  async getFriendsList(): Promise<Friend[]> {
    const response = await fetch("/api/friends/", {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch friends list");
    }
    console.log(data);

    // Transform backend response to match frontend interface
    return data;
  }

  async deleteFriend(friendId: number): Promise<void> {
    const response = await fetch(`/api/friends/${friendId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete friend");
    }
  }

  async addFriend(username: string): Promise<void> {
    const response = await fetch("/api/friends/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add friend");
    }
  }
}

export const friendService = new FriendService();
