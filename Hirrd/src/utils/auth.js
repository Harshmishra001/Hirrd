// Simple JWT utilities for local authentication
export const generateToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }));
  const signature = btoa(`${header}.${payload}.secret`);
  return `${header}.${payload}.${signature}`;
};

export const verifyToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem('auth_token');
};

export const setStoredToken = (token) => {
  localStorage.setItem('auth_token', token);
};

export const removeStoredToken = () => {
  localStorage.removeItem('auth_token');
};

// Mock user database with localStorage persistence
const DEFAULT_USERS = [
  {
    id: 'user_123',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'candidate'
  },
  {
    id: 'user_456',
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'recruiter'
  }
];

// Load users from localStorage or use default users
const loadUsers = () => {
  try {
    const storedUsers = localStorage.getItem('mock_users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
  }
  return [...DEFAULT_USERS];
};

// Save users to localStorage
const saveUsers = (users) => {
  try {
    localStorage.setItem('mock_users', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

// Initialize users
let MOCK_USERS = loadUsers();

export const authenticateUser = (email, password) => {
  // Reload users from localStorage to get latest data
  MOCK_USERS = loadUsers();
  
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const registerUser = (userData) => {
  // Reload users from localStorage to get latest data
  MOCK_USERS = loadUsers();
  
  // Check if user already exists
  const existingUser = MOCK_USERS.find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Create new user
  const newUser = {
    id: `user_${Date.now()}`,
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role || 'candidate'
  };
  
  // Add to array and save to localStorage
  MOCK_USERS.push(newUser);
  saveUsers(MOCK_USERS);
  
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const getUserById = (id) => {
  // Reload users from localStorage to get latest data
  MOCK_USERS = loadUsers();
  
  const user = MOCK_USERS.find(u => u.id === id);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

// Utility function to reset users to default (for development)
export const resetUsersToDefault = () => {
  MOCK_USERS = [...DEFAULT_USERS];
  saveUsers(MOCK_USERS);
  console.log('Users reset to default');
};

// Utility function to get all users (for debugging)
export const getAllUsers = () => {
  MOCK_USERS = loadUsers();
  return MOCK_USERS.map(user => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};