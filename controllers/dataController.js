const dataService = require('../services/dataService');

// Controller function to get user data
exports.getUserData = (req, res) => {
    const userId = req.query.user;  // Get the 'user' parameter from query string

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch data using the service
    const userData = dataService.getUserDataById(userId);

    if (!userData) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    // Send response
    res.status(200).json(userData);
};