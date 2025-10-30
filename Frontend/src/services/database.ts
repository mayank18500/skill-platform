// Frontend/src/services/database.ts - Mongoose API Integration
import { User, SwapRequest, SwapFeedback, AdminMessage } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const fetchData = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      // Attempt to read the error message from the backend response
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API call failed with status ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error);
    // Propagate a generic error or the specific message
    throw new Error('Database operation failed. Check server console.');
  }
};

// Database service for all CRUD operations
export class DatabaseService {

  // --- USERS ---
  static async getUsers(): Promise<User[]> {
    const users = await fetchData('/users');
    // Ensure all users have an isActive property for frontend logic (if missing in DB)
    return users.map((u: User) => ({ ...u, isActive: u.isActive ?? true })); 
  }

  static async getUserById(id: string): Promise<User | null> {
    const user = await fetchData(`/users/${id}`);
    return user as User;
  }

  static async createUser(user: Partial<User>): Promise<User | null> {
    const newUser = await fetchData('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return newUser as User;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const updatedUser = await fetchData(`/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return updatedUser as User;
  }
  
  // --- SWAP REQUESTS (Placeholders - you must create the Express routes for these) ---
  static async getSwapRequests(): Promise<SwapRequest[]> {
    const requests = await fetchData('/swaps'); 
    return requests as SwapRequest[];
  }

  static async createSwapRequest(request: Omit<SwapRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SwapRequest | null> {
    const newRequest = await fetchData('/swaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return newRequest as SwapRequest;
  }
  
  static async updateSwapRequest(id: string, updates: Partial<SwapRequest>): Promise<SwapRequest | null> {
    const updatedRequest = await fetchData(`/swaps/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return updatedRequest as SwapRequest;
  }

  // --- FEEDBACK (Placeholders - you must create the Express routes for these) ---
  static async getFeedback(): Promise<SwapFeedback[]> {
    const feedback = await fetchData('/feedback');
    return feedback as SwapFeedback[];
  }

  static async createFeedback(feedbackData: Omit<SwapFeedback, 'id' | 'created_at'>): Promise<SwapFeedback | null> {
    const newFeedback = await fetchData('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    return newFeedback as SwapFeedback;
  }

  // --- ADMIN MESSAGES (Placeholders - you must create the Express routes for these) ---
  static async getAdminMessages(): Promise<AdminMessage[]> {
    const messages = await fetchData('/messages');
    return messages as AdminMessage[];
  }

  static async createAdminMessage(message: Omit<AdminMessage, 'id' | 'created_at'>): Promise<AdminMessage | null> {
    const newMessage = await fetchData('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return newMessage as AdminMessage;
  }

  static async updateAdminMessage(id: string, updates: Partial<AdminMessage>): Promise<AdminMessage | null> {
    const updatedMessage = await fetchData(`/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return updatedMessage as AdminMessage;
  }

  static async deleteAdminMessage(id: string): Promise<boolean> {
    await fetchData(`/messages/${id}`, { method: 'DELETE' });
    return true; // Assume success if no error thrown
  }

  // --- SEARCH AND ANALYTICS (Requires complex Mongoose aggregation in Express) ---
  static async searchUsers(
    skill: string,
    filters: {
      location?: string;
      rating?: string;
      availability?: string;
    } = {}
  ): Promise<User[]> {
    // This will require a custom GET request to your API that handles the filtering logic
    const query = new URLSearchParams({ 
        skill, 
        location: filters.location || '', 
        rating: filters.rating || '', 
        availability: filters.availability || '' 
    }).toString();
    
    const users = await fetchData(`/search/users?${query}`);
    return users as User[];
  }

  static async getAnalytics() {
    // This will require a specific Express route for calculating analytics
    const analytics = await fetchData('/analytics/dashboard');
    return analytics;
  }
}