const db = require('../db'); // Adjust path as necessary, assuming db/index.js

const groupController = {
    // Create a new group
    createGroup: async (req, res) => {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Group name is required' });
        }
        try {
            const result = await db.query(
                'INSERT INTO block_group (name) VALUES ($1) RETURNING *',
                [name]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating group:', err.message, err.stack);
            if (err.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'Group name already exists' });
            }
            res.status(500).json({ error: 'Internal server error while creating group' });
        }
    },

    // Get all groups
    getAllGroups: async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM block_group ORDER BY name ASC');
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching all groups:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error while fetching groups' });
        }
    },

    // Get a single group by ID
    getGroupById: async (req, res) => {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID must be a valid integer' });
        }
        try {
            const result = await db.query('SELECT * FROM block_group WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Group not found' });
            }
            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error fetching group by ID:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error while fetching group' });
        }
    },

    // Get a single group by name
    getGroupByName: async (req, res) => {
        const { name } = req.params;
        try {
            const result = await db.query('SELECT * FROM block_group WHERE name ILIKE $1', [name]); // ILIKE for case-insensitive search
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Group not found with that name' });
            }
            res.status(200).json(result.rows[0]); // Assuming name is unique, otherwise return all matches
        } catch (err) {
            console.error('Error fetching group by name:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error while fetching group' });
        }
    },

    // Update an existing group
    updateGroup: async (req, res) => {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID must be a valid integer' });
        }
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Group name is required for update' });
        }
        try {
            const result = await db.query(
                'UPDATE block_group SET name = $1 WHERE id = $2 RETURNING *',
                [name, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Group not found for update' });
            }
            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error updating group:', err.message, err.stack);
            if (err.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'Group name already exists' });
            }
            res.status(500).json({ error: 'Internal server error while updating group' });
        }
    },

    // Delete a group
    deleteGroup: async (req, res) => {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID must be a valid integer' });
        }
        try {
            const result = await db.query(
                'DELETE FROM block_group WHERE id = $1 RETURNING *',
                [id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Group not found for deletion' });
            }
            // Consider implications if time_blocks are associated (ON DELETE SET NULL was used in schema)
            res.status(200).json({ message: 'Group deleted successfully', deletedGroup: result.rows[0] });
            // Or use res.status(204).send(); for no content response
        } catch (err) {
            console.error('Error deleting group:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error while deleting group' });
        }
    }
};

module.exports = groupController;
