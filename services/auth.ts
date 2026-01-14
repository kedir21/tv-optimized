import { User } from '../types';

const USERS_KEY = 'cinestream_users';
const SESSION_KEY = 'cinestream_session';

export const authService = {
  getUsers: (): User[] => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  },

  getCurrentUser: (): User | null => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  },

  login: (identifier: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = authService.getUsers();
        // In a real app, password should be hashed. Here we simulate it.
        // We'll assume the user object stored contains the password for this mock.
        const user = users.find((u: any) => 
          (u.email === identifier || u.username === identifier) && u.password === password
        );

        if (user) {
          const { password: _, ...safeUser } = user as any; // Exclude password from session
          localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
          // Notify watchlist service that user changed
          window.dispatchEvent(new Event('auth-changed'));
          resolve(safeUser);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800); // Fake network delay
    });
  },

  register: (username: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = authService.getUsers();
        if (users.some((u) => u.email === email)) {
          reject(new Error('Email already registered'));
          return;
        }
        if (users.some((u) => u.username === username)) {
          reject(new Error('Username already taken'));
          return;
        }

        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          username,
          email,
          password, // Mock storage
          joinedAt: new Date().toISOString(),
        };

        (users as any[]).push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        const { password: _, ...safeUser } = newUser;
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
        window.dispatchEvent(new Event('auth-changed'));
        
        resolve(safeUser);
      }, 800);
    });
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('auth-changed'));
    window.dispatchEvent(new Event('watchlist-updated')); // Clear watchlist view
  }
};