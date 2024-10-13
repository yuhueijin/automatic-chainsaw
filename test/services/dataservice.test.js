const dataService = require('../../src/services/dataService');
const axios = require('axios');

jest.mock('axios'); // Mock the axios library

describe('DataService', () => {
    describe('getNumbersDivisibleById', () => {
        it('should return numbers divisible by the given ID', async () => {
            const numbers = [10, 21, 30, 41, 50];
            // Mock the API response
            const mockResponse = { data: numbers };
            axios.get.mockResolvedValue(mockResponse);

            const id = 10;

            const result = await dataService.getNumbersDivisibleById(id);

            // Assertions
            expect(result).toEqual([10, 30, 50]);
        });

        it('should return an empty array if no numbers are divisible by the ID', async () => {
            const numbers = [3, 5, 7];
            // Mock the API response
            const mockResponse = { data: numbers };
            axios.get.mockResolvedValue(mockResponse);
            const id = 10;

            const result = await dataService.getNumbersDivisibleById(id);

            // Assertions
            expect(result).toEqual([]);
        });
    });
});
