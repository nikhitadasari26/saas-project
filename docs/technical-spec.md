# Technical Specification

## Project Structure
- **/backend**: Express.js API server.
  - **/controllers**: Logic for each module (Auth, Project, etc.).
  - **/routes**: API endpoint definitions.
  - **/middleware**: Auth and Tenant isolation logic.
- **/frontend**: React.js user interface.
- **/docs**: Project documentation and diagrams.

## Development Setup
1. Ensure Docker Desktop is running.
2. Run `docker-compose up --build -d` in the root folder.
3. The database will initialize automatically via `init-db.js`.
4. Access the frontend at `http://localhost:3000`.