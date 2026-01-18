# Monorepo with Django Backend and React Frontend

This project is a monorepo containing a Django backend and a React frontend.

## Prerequisites

- Python 3.x
- Node.js and npm (or yarn)

## Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    ```
3.  Activate the virtual environment:
    -   On macOS and Linux:
        ```bash
        source venv/bin/activate
        ```
    -   On Windows:
        ```bash
        venv\Scripts\activate
        ```
4.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  **Environment Configuration:**
    Create a `.env` file by copying the example file. This file will hold your secret keys and environment-specific settings.
    ```bash
    cp .env.example .env
    ```
    Review and update the `backend/.env` file with your settings if needed.

6.  Run the migrations:
    ```bash
    python manage.py migrate
    ```
7.  Start the development server:
    ```bash
    python manage.py runserver
    ```
    The backend will be running at `http://127.0.0.1:8000`.

## Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
3.  **Environment Configuration:**
    Create local environment files by copying the example files. These will store the API URL for different environments.
    ```bash
    cp .env.development.example .env.development
    cp .env.production.example .env.production
    ```
    Update the `frontend/.env.development` and `frontend/.env.production` files with the correct API URLs for your environments.

4.  Start the development server:
    ```bash
    npm start
    ```
    or
    ```bash
    yarn start
    ```
    The frontend will be running at `http://localhost:3000/add`.

## Usage

-   Open your browser and go to `http://localhost:3000/add` to add a new professional.
-   Navigate to the "View Professionals" tab or go to `http://localhost:3000/list` to see the list of professionals.

## Production Readiness Recommendations

Here is a list of recommendations to make this project production-ready.

### Project Cleanup

As a step towards production readiness, the following cleanup and optimization tasks have been performed:
- **Migration Squashing:** The database migrations for the `myapp` application have been squashed into a single initial migration. This provides a cleaner history and can speed up the process of setting up new database instances.
- **Database Indexing:** A database index has been added to the `source` field of the `Professional` model to optimize the performance of filtering queries.

### 1. Security

*   **Disable `DEBUG` mode:** In `settings.py`, `DEBUG` must be set to `False`. This is the most critical security setting to prevent exposure of sensitive configuration.
*   **Configure `ALLOWED_HOSTS`:** Set `ALLOWED_HOSTS` in `settings.py` to the specific domain(s) that will host the application.
*   **Secret Key Management:** The `SECRET_KEY` should not be hardcoded in `settings.py`. Load it from an environment variable or a secrets management service (e.g., HashiCorp Vault, AWS Secrets Manager).
*   **CORS Configuration:** Set `CORS_ALLOW_ALL_ORIGINS` to `False`. `CORS_ALLOWED_ORIGINS` should be a specific list of frontend domains.
*   **HTTPS:** Ensure the application is served over HTTPS. This is typically handled by a reverse proxy like Nginx.

### 2. Database

*   **Use a Production Database:** Switch from SQLite to a more robust database like PostgreSQL, which is well-suited for production Django applications.
*   **Database Indexing:** (✓ Done) Add database indexes (`db_index=True`) to model fields that are frequently used in query filters (e.g., the `source` field on the `Professional` model) to improve query performance.

### 3. Performance

*   **Caching:** Implement a caching strategy (e.g., using Redis or Memcached) for frequently accessed data or expensive queries to reduce database load and improve response times.
*   **Static & Media Files:** Use a dedicated service like Amazon S3 or a Content Delivery Network (CDN) to serve static and media files.
*   **Asynchronous Tasks:** For long-running operations, such as the bulk upsert endpoint if it needs to handle a very large number of profiles, use a task queue like Celery with a message broker like RabbitMQ or Redis.

### 4. Reliability & Monitoring

*   **Logging:** Configure structured logging to capture detailed information about requests, errors, and application behavior. Send logs to a centralized logging service (e.g., ELK Stack, Datadog, Sentry).
*   **Error Tracking:** Integrate an error tracking service like Sentry to get real-time error notifications with stack traces.
*   **Health Checks:** Create a dedicated health check endpoint that monitoring services can use to verify that the application is running correctly.
*   **Environment Configuration:** Use environment variables for all configuration that differs between environments (development, staging, production). The `python-decouple` or `django-environ` packages are excellent for this.

### 5. Deployment & CI/CD

*   **WSGI Server:** Do not use the Django development server (`manage.py runserver`) in production. Use a production-grade WSGI server like Gunicorn or uWSGI.
*   **Reverse Proxy:** Place a web server like Nginx in front of the WSGI server to handle tasks like serving static files, SSL termination (HTTPS), and load balancing.
*   **Containerization:** Containerize the application using Docker and Docker Compose to create consistent and reproducible environments for development and production.
*   **CI/CD Pipeline:** Set up a Continuous Integration/Continuous Deployment (CI/CD) pipeline (e.g., using GitHub Actions, GitLab CI) to automate testing and deployment processes.
