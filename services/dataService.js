// Mock data for demonstration
const users = {
    1: { id: 1, name: 'Alice', age: 30 },
    2: { id: 2, name: 'Bob', age: 25 },
  };
  
  // Service function to get user data by ID
  exports.getUserDataById = (id) => {
    return users[id] || null;  // Return user data or null if not found
  };