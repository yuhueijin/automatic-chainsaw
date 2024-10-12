const express = require('express');
const router = express.Router();

const dataController = require('../controllers/dataController');

/* GET users listing. */
router.get('/', dataController.getUserData);

module.exports = router;