import { User, SwapRequest, SwapFeedback, AdminMessage } from '../types';
import { nanoid } from 'nanoid';

// --- MOCK DATABASE STATE (REPLACES POSTGRES TABLES) ---
let mockUsers: User[] = [
  // Sample users data from database-setup.sql, converted to camelCase for the User interface
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Alice Johnson', email: 'alice@example.com', location: 'New York, NY', profilePhoto: undefined, skillsOffered: ['JavaScript', 'React', 'Node.js'], skillsWanted: ['Python', 'Data Science'], availability: ['Weekdays', 'Evenings'], isPublic: true, role: 'user', rating: 4.8, totalSwaps: 12, joinDate: '2024-01-01', isActive: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Bob Smith', email: 'bob@example.com', location: 'San Francisco, CA', profilePhoto: undefined, skillsOffered: ['Python', 'Machine Learning'], skillsWanted: ['JavaScript', 'Web Development'], availability: ['Weekends', 'Afternoons'], isPublic: true, role: 'user', rating: 4.5, totalSwaps: 8, joinDate: '2024-01-05', isActive: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Carol Davis', email: 'carol@example.com', location: 'Chicago, IL', profilePhoto: undefined, skillsOffered: ['Graphic Design', 'Photoshop'], skillsWanted: ['Photography', 'Video Editing'], availability: ['Mornings', 'Weekdays'], isPublic: true, role: 'user', rating: 4.9, totalSwaps: 15, joinDate: '2024-01-10', isActive: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'David Wilson', email: 'david@example.com', location: 'Austin, TX', profilePhoto: undefined, skillsOffered: ['Guitar', 'Music Production'], skillsWanted: ['Piano', 'Singing'], availability: ['Evenings', 'Weekends'], isPublic: true, role: 'user', rating: 4.2, totalSwaps: 6, joinDate: '2024-01-15', isActive: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Emma Brown', email: 'emma@example.com', location: 'Seattle, WA', profilePhoto: undefined, skillsOffered: ['Cooking', 'Baking'], skillsWanted: ['Gardening', 'Yoga'], availability: ['Mornings', 'Weekdays'], isPublic: true, role: 'user', rating: 4.7, totalSwaps: 10, joinDate: '2024-01-20', isActive: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'auth_admin_id', name: 'Admin User', email: 'admin@skillswap.com', location: 'Global', profilePhoto: undefined, skillsOffered: [], skillsWanted: [], availability: [], isPublic: false, role: 'admin', rating: 5.0, totalSwaps: 0, joinDate: '2024-01-01', isActive: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

let mockSwapRequests: SwapRequest[] = [
  // Sample swap requests, using snake_case as per SwapRequest type
  { id: 'swap-1', from_user_id: '550e8400-e29b-41d4-a716-446655440001', to_user_id: '550e8400-e29b-41d4-a716-446655440002', skill_offered: 'JavaScript', skill_wanted: 'Python', message: 'I can help you learn JavaScript and React!', status: 'completed', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'swap-2', from_user_id: '550e8400-e29b-41d4-a716-446655440002', to_user_id: '550e8400-e29b-41d4-a716-446655440003', skill_offered: 'Python', skill_wanted: 'Graphic Design', message: 'Looking to learn some design skills', status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'swap-3', from_user_id: '550e8400-e29b-41d4-a716-446655440003', to_user_id: '550e8400-e29b-41d4-a716-446655440004', skill_offered: 'Graphic Design', skill_wanted: 'Guitar', message: 'Would love to learn guitar!', status: 'accepted', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'swap-4', from_user_id: '550e8400-e29b-41d4-a716-446655440004', to_user_id: '550e8400-e29b-41d4-a716-446655440005', skill_offered: 'Music Production', skill_wanted: 'Cooking', message: 'Interested in learning to cook', status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

let mockFeedback: SwapFeedback[] = [
  // Sample feedback, using snake_case as per SwapFeedback type
  { id: 'fb-1', from_user_id: '550e8400-e29b-41d4-a716-446655440002', to_user_id: '550e8400-e29b-41d4-a716-446655440001', swap_request_id: 'swap-1', rating: 5, comment: 'Great teacher! Learned a lot about JavaScript.', created_at: new Date().toISOString() },
  { id: 'fb-2', from_user_id: '550e8400-e29b-41d4-a716-446655440001', to_user_id: '550e8400-e29b-41d4-a716-446655440002', swap_request_id: 'swap-1', rating: 4, comment: 'Excellent Python tutor, very patient.', created_at: new Date().toISOString() },
];

let mockAdminMessages: AdminMessage[] = [
  { id: 'msg-1', title: 'Welcome to SkillSwap!', content: 'We\'re excited to have you join our community. Start by browsing skills and connecting with others!', type: 'info', is_active: true, created_at: new Date().toISOString() },
  { id: 'msg-2', title: 'Platform Maintenance', content: 'We\'ll be performing maintenance on Sunday at 2 AM EST. Service may be briefly interrupted.', type: 'maintenance', is_active: true, created_at: new Date().toISOString() },
];


// Helper function to simulate joins/nested objects (common pattern in NoSQL/API responses)
const embedUsers = (requests: SwapRequest[]): SwapRequest[] => {
    return requests.map(req => ({
        ...req,
        from_user: mockUsers.find(u => u.id === req.from_user_id),
        to_user: mockUsers.find(u => u.id === req.to_user_id),
        feedback: mockFeedback.find(f => f.swap_request_id === req.id)
    })) as SwapRequest[];
}

const simulateLatency = () => new Promise(resolve => setTimeout(resolve, 300));

// Database service for all CRUD operations
export class DatabaseService {

  // --- USERS ---
  static async getUsers(): Promise<User[]> {
    await simulateLatency();
    // Simulate MongoDB find() and sort()
    return mockUsers.slice().sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  static async getUserById(id: string): Promise<User | null> {
    await simulateLatency();
    // Simulate MongoDB findOne({ id: id })
    return mockUsers.find(u => u.id === id) || null;
  }

  static async createUser(user: Partial<User> & { id: string }): Promise<User | null> {
    await simulateLatency();
    const newUser: User = {
        ...user,
        id: user.id, 
        name: user.name || 'New User',
        email: user.email || '',
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        availability: user.availability || [],
        isPublic: user.isPublic ?? true,
        role: user.role || 'user',
        rating: user.rating || 5.0,
        totalSwaps: user.totalSwaps || 0,
        joinDate: user.joinDate || new Date().toISOString().split('T')[0],
        isActive: user.isActive ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    } as User;

    // Simulate MongoDB insertOne()
    mockUsers.push(newUser);
    return newUser;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await simulateLatency();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return null;

    // Simulate MongoDB updateOne({ id: id }, { $set: updates })
    mockUsers[index] = {
      ...mockUsers[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockUsers[index];
  }

  // --- SWAP REQUESTS ---
  static async getSwapRequests(): Promise<SwapRequest[]> {
    await simulateLatency();
    // Simulate data retrieval with embedded sub-documents/joins
    const sortedRequests = mockSwapRequests.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return embedUsers(sortedRequests);
  }

  static async createSwapRequest(request: Omit<SwapRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SwapRequest | null> {
    await simulateLatency();
    const newRequest: SwapRequest = {
      ...request,
      id: nanoid(),
      status: request.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockSwapRequests.push(newRequest);
    return embedUsers([newRequest])[0];
  }

  static async updateSwapRequest(id: string, updates: Partial<SwapRequest>): Promise<SwapRequest | null> {
    await simulateLatency();
    const index = mockSwapRequests.findIndex(r => r.id === id);
    if (index === -1) return null;

    mockSwapRequests[index] = {
      ...mockSwapRequests[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return embedUsers([mockSwapRequests[index]])[0];
  }

  // --- FEEDBACK ---
  static async getFeedback(): Promise<SwapFeedback[]> {
    await simulateLatency();
    return mockFeedback.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async createFeedback(feedbackData: Omit<SwapFeedback, 'id' | 'created_at'>): Promise<SwapFeedback | null> {
    await simulateLatency();
    const newFeedback: SwapFeedback = {
        ...feedbackData,
        id: nanoid(),
        created_at: new Date().toISOString()
    };
    mockFeedback.push(newFeedback);
    return newFeedback;
  }

  // --- ADMIN MESSAGES ---
  static async getAdminMessages(): Promise<AdminMessage[]> {
    await simulateLatency();
    return mockAdminMessages.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async createAdminMessage(message: Omit<AdminMessage, 'id' | 'created_at'>): Promise<AdminMessage | null> {
    await simulateLatency();
    const newMessage: AdminMessage = {
      ...message,
      id: nanoid(),
      is_active: message.is_active ?? true,
      created_at: new Date().toISOString()
    };
    mockAdminMessages.push(newMessage);
    return newMessage;
  }

  static async updateAdminMessage(id: string, updates: Partial<AdminMessage>): Promise<AdminMessage | null> {
    await simulateLatency();
    const index = mockAdminMessages.findIndex(m => m.id === id);
    if (index === -1) return null;

    mockAdminMessages[index] = {
      ...mockAdminMessages[index],
      ...updates
    };
    return mockAdminMessages[index];
  }

  static async deleteAdminMessage(id: string): Promise<boolean> {
    await simulateLatency();
    const initialLength = mockAdminMessages.length;
    mockAdminMessages = mockAdminMessages.filter(m => m.id !== id);
    return mockAdminMessages.length < initialLength;
  }

  // --- SEARCH AND ANALYTICS ---
  static async searchUsers(
    skill: string,
    filters: {
      location?: string;
      rating?: string;
      availability?: string;
    } = {}
  ): Promise<User[]> {
    await simulateLatency();
    const minRating = filters.rating && filters.rating !== 'all' ? parseFloat(filters.rating) : 0;
    
    // Simulate complex MongoDB find/aggregate queries
    return mockUsers.filter(user => {
      const matchesSkill = skill.trim() === '' || user.skillsOffered.some(s => s.toLowerCase().includes(skill.toLowerCase()));
      const matchesLocation = filters.location === '' || user.location === filters.location;
      const matchesRating = user.rating >= minRating;
      const matchesAvailability = filters.availability === 'all' || user.availability.includes(filters.availability || '');
      const isSearchable = user.isPublic && user.isActive && user.role === 'user';

      return matchesSkill && matchesLocation && matchesRating && matchesAvailability && isSearchable;
    });
  }

  static async getAnalytics() {
    await simulateLatency();
    const regularUsers = mockUsers.filter(u => u.role !== 'admin');
    const activeUsers = regularUsers.filter(u => u.isActive).length;
    const pendingSwaps = mockSwapRequests.filter(r => r.status === 'pending').length;
    const completedSwaps = mockSwapRequests.filter(r => r.status === 'completed').length;
    const averageRating = mockFeedback.length > 0 
      ? parseFloat((mockFeedback.reduce((sum, f) => sum + f.rating, 0) / mockFeedback.length).toFixed(1))
      : 5.0;

    const skillCounts = regularUsers.flatMap(u => u.skillsOffered).reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    return {
      totalUsers: regularUsers.length,
      activeUsers,
      pendingSwaps,
      completedSwaps,
      averageRating,
      topSkills
    };
  }
}