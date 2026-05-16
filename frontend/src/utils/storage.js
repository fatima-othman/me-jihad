export const STORAGE_KEYS = {
  token: 'strategai_token',
  user: 'strategai_user',
};

export const storage = {
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.token);
  },
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.token, token);
  },
  removeToken() {
    localStorage.removeItem(STORAGE_KEYS.token);
  },
  getUser() {
    const rawUser = localStorage.getItem(STORAGE_KEYS.user);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch {
      localStorage.removeItem(STORAGE_KEYS.user);
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  },
  removeUser() {
    localStorage.removeItem(STORAGE_KEYS.user);
  },
  clearAuth() {
    this.removeToken();
    this.removeUser();
  },
};
