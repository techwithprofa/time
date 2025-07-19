const express = require('express');
const router = express.Router();
const timelineEntryController = require('../controllers/timelineEntryController');

// Route to create a new timeline entry
router.post('/', timelineEntryController.createTimelineEntry);

// Route to get all timeline entries (or filter by date range)
router.get('/', timelineEntryController.getTimelineEntries);

// Route to update an existing timeline entry by ID
router.put('/:id', timelineEntryController.updateTimelineEntry);

// Route to delete a timeline entry by ID
router.delete('/:id', timelineEntryController.deleteTimelineEntry);

module.exports = router;
