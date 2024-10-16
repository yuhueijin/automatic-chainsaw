const express = require('express');
const dataController = require('../controllers/dataController');

const router = express.Router();

router.get('/', dataController.getUserData);

module.exports = router;