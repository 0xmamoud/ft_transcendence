interface TwoFactorService {
  loginWith2FA(userId: number, token: string): Promise<{ message: string }>;
  getQRCode(): Promise<string>;
  enable2FA(token: string): Promise<{ message: string }>;
  verify2FA(token: string): Promise<{ message: string }>;
}

class TwoFactorService implements TwoFactorService {
  async loginWith2FA(userId: number, token: string) {
    const response = await fetch("/api/2fa/login-with-2fa", {
      method: "POST",
      body: JSON.stringify({ userId, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to login with 2FA");
    }

    return data;
  }

  async getQRCode() {
    const response = await fetch("/api/2fa/qr", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get QR code");
    }

    return data.qrCode;
  }

  async enable2FA(token: string) {
    const response = await fetch("/api/2fa/enable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to enable 2FA");
    }

    return data;
  }

  async verify2FA(token: string) {
    const response = await fetch("/api/2fa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify 2FA");
    }

    return data;
  }
}

export const twoFactorService = new TwoFactorService();
