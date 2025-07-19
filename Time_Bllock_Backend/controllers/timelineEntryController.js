const db = require('../db'); // Assuming db/index.js handles database connections

const timelineEntryController = {
    // Create a new timeline entry
    createTimelineEntry: async (req, res) => {
        const { time_block_id, start_time, end_time } = req.body;

        if (time_block_id === undefined || !start_time || !end_time) {
            return res.status(400).json({ error: 'time_block_id, start_time, and end_time are required' });
        }
        if (isNaN(parseInt(time_block_id))) {
            return res.status(400).json({ error: 'time_block_id must be an integer' });
        }
        // Basic ISO 8601 validation (can be improved with a library like moment.js or date-fns if needed)
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
        if (!iso8601Regex.test(start_time)) {
            return res.status(400).json({ error: 'start_time must be a valid ISO 8601 date-time string' });
        }
        if (!iso8601Regex.test(end_time)) {
            return res.status(400).json({ error: 'end_time must be a valid ISO 8601 date-time string' });
        }

        if (new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({ error: 'end_time must be after start_time' });
        }

        try {
            const result = await db.query(
                'INSERT INTO timeline_entries (time_block_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING *',
                [parseInt(time_block_id), start_time, end_time]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating timeline entry:', err.message, err.stack);
            if (err.code === '23503') { // Foreign key violation for time_block_id
                return res.status(400).json({ error: `Invalid time_block_id: ${time_block_id}. Time block does not exist.` });
            }
            if (err.code === '23514') { // Check constraint violation (e.g. end_time > start_time)
                return res.status(400).json({ error: 'Database check constraint violated: end_time must be greater than start_time.' });
            }
            res.status(500).json({ error: 'Internal server error while creating timeline entry' });
        }
    },

    // Get timeline entries (optionally filtered by date range)
    getTimelineEntries: async (req, res) => {
        const { startDate, endDate } = req.query;
        let query;
        const params = [];

        // Basic ISO 8601 validation for query parameters
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

        if (startDate && !iso8601Regex.test(startDate)) {
            return res.status(400).json({ error: 'startDate must be a valid ISO 8601 date-time string if provided' });
        }
        if (endDate && !iso8601Regex.test(endDate)) {
            return res.status(400).json({ error: 'endDate must be a valid ISO 8601 date-time string if provided' });
        }
        
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ error: 'endDate must be after startDate when both are provided' });
        }

        let baseQuery = `
            SELECT te.*, tb.name as time_block_name, tb.color_code, tb.description as time_block_description 
            FROM timeline_entries te 
            JOIN time_block tb ON te.time_block_id = tb.id`;

        if (startDate && endDate) {
            query = `${baseQuery} WHERE te.start_time >= $1 AND te.end_time <= $2 ORDER BY te.start_time ASC;`;
            params.push(startDate, endDate);
        } else if (startDate) {
            query = `${baseQuery} WHERE te.start_time >= $1 ORDER BY te.start_time ASC;`;
            params.push(startDate);
        } else if (endDate) {
            query = `${baseQuery} WHERE te.end_time <= $1 ORDER BY te.start_time ASC;`;
            params.push(endDate);
        }
        else {
            query = `${baseQuery} ORDER BY te.start_time ASC;`;
        }

        try {
            const result = await db.query(query, params);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching timeline entries:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error while fetching timeline entries' });
        }
    },

    // Update an existing timeline entry
    updateTimelineEntry: async (req, res) => {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID must be a valid integer' });
        }

        const { start_time, end_time, time_block_id } = req.body;

        // For simplicity, require both start_time and end_time if either is being updated.
        // time_block_id is optional for update.
        if ((start_time || end_time) && (!start_time || !end_time)) {
            return res.status(400).json({ error: 'Both start_time and end_time are required if one is provided for update' });
        }
        
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
        if (start_time && !iso8601Regex.test(start_time)) {
            return res.status(400).json({ error: 'start_time must be a valid ISO 8601 date-time string' });
        }
        if (end_time && !iso8601Regex.test(end_time)) {
            return res.status(400).json({ error: 'end_time must be a valid ISO 8601 date-time string' });
        }
        if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({ error: 'end_time must be after start_time' });
        }
        if (time_block_id !== undefined && isNaN(parseInt(time_block_id))) {
            return res.status(400).json({ error: 'time_block_id must be an integer if provided' });
        }

        // Dynamically build SET clause
        const setClauses = [];
        const values = [];
        let paramCount = 1;

        if (time_block_id !== undefined) {
            setClauses.push(`time_block_id = $${paramCount++}`);
            values.push(parseInt(time_block_id));
        }
        if (start_time) {
            setClauses.push(`start_time = $${paramCount++}`);
            values.push(start_time);
        }
        if (end_time) {
            setClauses.push(`end_time = $${paramCount++}`);
            values.push(end_time);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No update fields provided (time_block_id, start_time, or end_time)' });
        }

        values.push(parseInt(id)); // For WHERE id = $N

        const queryString = `UPDATE timeline_entries SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        try {
            const result = await db.query(queryString, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Timeline entry not found for update' });
            }
            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error updating timeline entry:', err.message, err.stack);
            if (err.code === '23503') { // Foreign key violation for time_block_id
                return res.status(400).json({ error: `Invalid time_block_id: ${time_block_id}. Time block does not exist.` });
            }
            if (err.code === '23514') { // Check constraint violation (e.g. end_time > start_time)
                return res.status(400).json({ error: 'Database check constraint violated: end_time must be greater than start_time.' });
            }
            res.status(500).json({ error: 'Internal server error while updating timeline entry' });
        }
    },

    // Delete a timeline entry
    deleteTimelineEntry: async (req, res) => {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID must be a valid integer' });
        }
        try {
            const result = await db.query(
                'DELETE FROM timeline_entries WHERE id = $1 RETURNING *',
                [parseInt(id)]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Timeline entry not found for deletion' });
            }
            res.status(200).json({ message: 'Timeline entry deleted successfully', deletedEntry: result.rows[0] });
            // Or res.status(204).send(); for no content
        } catch (err) {
            console.error('Error deleting timeline entry:', err.message, err.stack);
            res.status(500).json({ error: 'Internal server error while deleting timeline entry' });
        }
    }
};

module.exports = timelineEntryController;
