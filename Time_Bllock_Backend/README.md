# Time Block API Project

A Node.js and PostgreSQL backend for managing time blocks and groups, containerized with Docker.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Environment Configuration (`.env` file)](#2-environment-configuration-env-file)
  - [3. Build and Run with Docker Compose](#3-build-and-run-with-docker-compose)
- [API Endpoints](#api-endpoints)
  - [Block Groups (`/api/groups`)](#block-groups-apigroups)
  - [Time Blocks (`/api/timeblocks`)](#time-blocks-apitimeblocks)
- [Database Schema](#database-schema)
- [Stopping the Application](#stopping-the-application)
- [Troubleshooting](#troubleshooting)

## Overview

This project provides a RESTful API for creating, managing, and tracking time blocks. Each time block can be associated with a group (e.g., 'Work', 'Personal').

## Features

-   **Group Management:** Create, read, update, and delete groups.
-   **Time Block Management:** Create, read, update, and delete time blocks.
-   **Database:** Uses PostgreSQL for data storage.
-   **Containerized:** Fully containerized using Docker and Docker Compose for easy setup and deployment.
-   **API:** RESTful API for interaction.

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (Usually included with Docker Desktop)

## Getting Started

### 1. Clone the Repository

```bash
git clone [URL_OF_YOUR_GIT_REPOSITORY] # Replace with your actual repo URL if applicable
cd [YOUR_PROJECT_DIRECTORY_NAME]     # Replace with your project's root directory name
```

### 2. Environment Configuration (`.env` file)

Create a `.env` file in the root of the project. This file stores configuration variables for the application and database.

Copy the example below into your `.env` file and adjust the values as needed, especially `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE` if you have specific preferences. The `DB_HOST` should remain `db` for Docker Compose networking. `API_PORT` is the port your Node.js application will listen on inside its container, and this is mapped to the host in `docker-compose.yml`. `DB_PORT_EXTERNAL` is the port on your host machine that will map to the PostgreSQL container's port 5432.

**.env example:**
```env
# Node.js Application Configuration
API_PORT=3000

# PostgreSQL Database Configuration
DB_USER=timeblockadmin
DB_HOST=db # Service name in docker-compose, do not change for app <-> db communication
DB_DATABASE=timeblock_db
DB_PASSWORD=supersecretpassword
DB_PORT=5432 # Internal port for PostgreSQL within Docker network

# Port mapping for accessing DB from host machine (optional, for external tools)
DB_PORT_EXTERNAL=5433
```

**Note:** The `docker-compose.yml` file is configured to use these variables. The `db` service (PostgreSQL) uses `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE` to initialize itself. The `app` service (Node.js) uses all of them to connect to the database and expose its port.

### 3. Build and Run with Docker Compose

Once Docker and Docker Compose are running, and you have your `.env` file configured:

```bash
docker-compose up --build -d
```

-   `--build`: Forces Docker to rebuild the images if there are changes in the `Dockerfile` or application code.
-   `-d`: Runs the containers in detached mode (in the background).

You should see output from both the `app` and `db` services. The Node.js application will be accessible at `http://localhost:3000` (or whatever `API_PORT` you set and mapped in `docker-compose.yml`). The PostgreSQL database will be accessible from your host machine on port `5433` (or `DB_PORT_EXTERNAL`).

The first time you run this, Docker will download the `postgres:15-alpine` and `node:18-alpine` images if they are not already on your system, and then build your application image. The `db/schema.sql` file will be used to initialize the database tables.

## API Endpoints

All endpoints are prefixed with `/api`.

### Block Groups (`/api/groups`)

-   `POST /groups`: Create a new group.
    -   Body: `{ "name": "New Group Name" }`
-   `GET /groups`: Get all groups.
-   `GET /groups/:id`: Get a group by ID.
-   `GET /groups/name/:name`: Get a group by name (case-insensitive).
-   `PUT /groups/:id`: Update a group.
    -   Body: `{ "name": "Updated Group Name" }`
-   `DELETE /groups/:id`: Remove a group.

### Time Blocks (`/api/timeblocks`)

-   `POST /timeblocks`: Create a new time block.
    -   Body: `{ "name": "My Task", "color_code": "#FF5733", "description": "Details about task", "duration_min": 60, "group_id": 1 }`
-   `GET /timeblocks`: Get all time blocks (includes group name).
-   `GET /timeblocks/:id`: Get a time block by ID (includes group name).
-   `GET /timeblocks/name/:name`: Get time blocks by name (case-insensitive search, includes group name).
-   `GET /timeblocks/group/:groupId`: Get time blocks by group ID (includes group name).
-   `PUT /timeblocks/:id`: Update a time block.
    -   Body: `{ "name": "Updated Task", "color_code": "#C70039", "description": "New details", "duration_min": 75, "group_id": 2 }`
-   `DELETE /timeblocks/:id`: Remove a time block.

## Database Schema

The database schema is defined in `db/schema.sql`. It consists of two main tables:

-   `block_group`: Stores group information (`id`, `name`).
-   `time_block`: Stores time block details (`id`, `name`, `color_code`, `description`, `duration_min`, `group_id`). `group_id` is a foreign key to `block_group.id`.

## Stopping the Application

To stop the running containers:

```bash
docker-compose down
```

If you want to remove the data volume for PostgreSQL (this will delete all your data):

```bash
docker-compose down -v
```

## Troubleshooting

-   **Port Conflicts:** If `API_PORT` (e.g., 3000) or `DB_PORT_EXTERNAL` (e.g., 5433) are already in use on your host machine, change them in your `.env` file and update the `ports` section in `docker-compose.yml` accordingly, then restart the containers.
-   **Database Connection Issues (App):**
    -   Ensure the `db` service is running (`docker-compose ps`).
    -   Verify `DB_HOST` in `.env` is set to `db`.
    -   Check that `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, and `DB_PORT` in your `.env` match the `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` for the `db` service in `docker-compose.yml` and the internal port for Postgres (5432).
-   **Initialization Script:** If the database tables are not created, check the logs of the `db` container (`docker-compose logs db`) for any errors related to the `/docker-entrypoint-initdb.d/init.sql` script.

```
