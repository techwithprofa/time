const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController'); // Correct path

// Define routes for block_group
router.post('/groups', groupController.createGroup);
router.get('/groups', groupController.getAllGroups);
router.get('/groups/:id', groupController.getGroupById);
router.get('/groups/name/:name', groupController.getGroupByName); // Route for searching by name
router.put('/groups/:id', groupController.updateGroup);
router.delete('/groups/:id', groupController.deleteGroup);

module.exports = router;
