const db = require('../db'); // Assuming db/index.js exists

const timeBlockController = {
    // Create a new time block
    createTimeBlock: async (req, res) => {
        const { name, color_code, description, duration_min, group_id } = req.body;
        if (!name || duration_min === undefined) {
            return res.status(400).json({ error: 'Name and duration_min are required for a time block' });
        }
        if (group_id && isNaN(parseInt(group_id))) {
            return res.status(400).json({ error: 'group_id must be an integer if provided' });
        }

        try {
            const result = await db.query(
                'INSERT INTO time_block (name, color_code, description, duration_min, group_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, color_code, description, parseInt(duration_min), group_id ? parseInt(group_id) : null]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating time block:', err.message, err.stack);
            // Check for foreign key violation if group_id is provided but doesn't exist
            if (err.code === '23503') { // Foreign key violation
                 return res.status(400).json({ error: `Invalid group_id: ${group_id}. Group does not exist.` });
            }
            res.status(500).json({ error: 'Internal server error while creating time block' });
        }
    },

    // Get all time blocks
    getAllTimeBlocks: async (req, res) => {
        try {
            // Optionally, join with block_group to get group name
            const result = await db.query(
                `SELECT tb.*, bg.name as group_name 
                 FROM time_block tb 
                 LEFT JOIN block_group bg ON tb.group_id = bg.id 
                 ORDER BY tb.id ASC`
            );
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching all time blocks:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error while fetching time blocks' });
        }
    },

    // Get a single time block by ID
    getTimeBlockById: async (req, res) => {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID must be a valid integer' });
        }
        try {
            const result = await db.query(
                `SELECT tb.*, bg.name as group_name 
                 FROM time_block tb 
                 LEFT JOIN block_group bg ON tb.group_id = bg.id 
                 WHERE tb.id = $1`, [id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Time block not found' });
            }
            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error fetching time block by ID:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get time blocks by name (case-insensitive search)
    getTimeBlocksByName: async (req, res) => {
        const { name } = req.params;
        try {
            const result = await db.query(
                `SELECT tb.*, bg.name as group_name 
                 FROM time_block tb 
                 LEFT JOIN block_group bg ON tb.group_id = bg.id 
                 WHERE tb.name ILIKE $1 
                 ORDER BY tb.id ASC`, [`%${name}%`] // Search for partial matches
            );
            if (result.rows.length === 0) {
                return res.status(200).json([]); // Return empty array instead of 404
            }
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching time blocks by name:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get time blocks by group ID
    getTimeBlocksByGroup: async (req, res) => {
        const { groupId } = req.params;
        if (isNaN(parseInt(groupId))) {
            return res.status(400).json({ error: 'group_id must be an integer' });
        }
        try {
            const result = await db.query(
                `SELECT tb.*, bg.name as group_name 
                 FROM time_block tb 
                 LEFT JOIN block_group bg ON tb.group_id = bg.id 
                 WHERE tb.group_id = $1 
                 ORDER BY tb.id ASC`, [parseInt(groupId)]
            );
            // It's not an error if a group has no time blocks, so return empty array if none found.
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching time blocks by group ID:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Update an existing time block
    updateTimeBlock: async (req, res) => {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID must be a valid integer' });
        }
        const { name, color_code, description, duration_min, group_id } = req.body;

        if (group_id && isNaN(parseInt(group_id))) {
            return res.status(400).json({ error: 'group_id must be an integer if provided' });
        }
        // Ensure at least one field is being updated (or handle this as client-side validation)
        // For simplicity, this example allows updating with the same values.

        try {
            const result = await db.query(
                `UPDATE time_block 
                 SET name = $1, color_code = $2, description = $3, duration_min = $4, group_id = $5 
                 WHERE id = $6 RETURNING *`,
                [name, color_code, description, parseInt(duration_min), group_id ? parseInt(group_id) : null, parseInt(id)]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Time block not found for update' });
            }
            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error updating time block:', err.message, err.stack);
            if (err.code === '23503') { // Foreign key violation for group_id
                 return res.status(400).json({ error: `Invalid group_id: ${group_id}. Group does not exist.` });
            }
            res.status(500).json({ error: 'Internal server error while updating time block' });
        }
    },

    // Delete a time block
    deleteTimeBlock: async (req, res) => {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID must be a valid integer' });
        }
        try {
            const result = await db.query(
                'DELETE FROM time_block WHERE id = $1 RETURNING *',
                [parseInt(id)]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Time block not found for deletion' });
            }
            res.status(200).json({ message: 'Time block deleted successfully', deletedTimeBlock: result.rows[0] });
            // Or res.status(204).send();
        } catch (err) {
            console.error('Error deleting time block:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error while deleting time block' });
        }
    }
};

module.exports = timeBlockController;
