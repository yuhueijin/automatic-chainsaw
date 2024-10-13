const axios = require('axios');

// Service function to get numbers divisible by the provided ID
exports.getNumbersDivisibleById = async (id) => {
    try {
        const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
        const numbers = response.data; 

        // Filter numbers divisible by the provided id
        const divisibleNumbers = numbers.filter(number => number % id === 0);

        return divisibleNumbers;
    } catch (error) {
        console.error('Error fetching top stories:', error);
        return null;
    }
};