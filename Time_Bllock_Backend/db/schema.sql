-- Drop tables if they exist to ensure a clean slate (optional, good for development)
DROP TABLE IF EXISTS time_block;
DROP TABLE IF EXISTS block_group;

-- Table: block_group
CREATE TABLE block_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Table: time_block
CREATE TABLE time_block (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color_code VARCHAR(7), -- Assuming hex color codes like #RRGGBB
    description TEXT,
    duration_min INTEGER NOT NULL,
    group_id INTEGER,
    CONSTRAINT fk_group
        FOREIGN KEY(group_id)
        REFERENCES block_group(id)
        ON DELETE SET NULL -- Or ON DELETE CASCADE if preferred. SET NULL means if a group is deleted, the time_block's group_id becomes NULL.
);

-- Table: timeline_entries
CREATE TABLE timeline_entries (
    id SERIAL PRIMARY KEY,
    time_block_id INTEGER,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_time_block
        FOREIGN KEY(time_block_id)
        REFERENCES time_block(id)
        ON DELETE CASCADE,
    CHECK (end_time > start_time)
);

-- Optional: Add some initial data for block_group for testing
INSERT INTO block_group (name) VALUES ('Work'), ('Personal'), ('Study');

-- Optional: Add some initial data for time_block for testing
-- Make sure group_id values correspond to existing ids in block_group (e.g., 1, 2, 3 if the above inserts are successful)
INSERT INTO time_block (name, color_code, description, duration_min, group_id) VALUES
('Morning Standup', '#007bff', 'Daily team meeting', 15, 1),
('Project A Coding', '#28a745', 'Focus time for Project A', 120, 1),
('Lunch Break', '#ffc107', 'Personal time for lunch', 60, 2),
('Gym Session', '#dc3545', 'Workout at the gym', 75, 2),
('Node.js Study', '#17a2b8', 'Learning new Node.js features', 90, 3);
