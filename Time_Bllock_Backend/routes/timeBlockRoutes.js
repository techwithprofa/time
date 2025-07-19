const express = require('express');
const router = express.Router();
const timeBlockController = require('../controllers/timeBlockController'); // Correct path

// Define routes for time_block
router.post('/timeblocks', timeBlockController.createTimeBlock);
router.get('/timeblocks', timeBlockController.getAllTimeBlocks);
router.get('/timeblocks/:id', timeBlockController.getTimeBlockById);
router.get('/timeblocks/name/:name', timeBlockController.getTimeBlocksByName);
router.get('/timeblocks/group/:groupId', timeBlockController.getTimeBlocksByGroup);
router.put('/timeblocks/:id', timeBlockController.updateTimeBlock);
router.delete('/timeblocks/:id', timeBlockController.deleteTimeBlock);

module.exports = router;
