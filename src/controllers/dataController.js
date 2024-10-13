const dataService = require('../services/dataService');

exports.getUserData = async (req, res) => {
    const userId = parseInt(req.query.user);

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
        const result = await dataService.getNumbersDivisibleById(userId);

        if (!result) {
            res.status(500).json({ error: 'Unable to fetch data' });
            return
        }

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
};