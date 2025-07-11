# SailsJS & React Product Management CMS

This is a full-stack application built with SailsJS backend and React frontend for product management. The application includes user authentication, product CRUD operations with Elasticsearch integration, and a modern UI with dark mode support.

## Project Structure

```
demo-prj/
├── backend/          # SailsJS backend
│   ├── api/          # Controllers, models, services
│   ├── config/       # Sails configuration files
│   └── ...
├── frontend/         # React frontend
│   ├── src/          # Source files
│   └── ...
└── readme.md         # This file
```

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Elasticsearch (v7.x or higher)

## Getting Started

### Setting up Elasticsearch

1. Make sure you have Docker installed on your system.
2. Run Elasticsearch using the following Docker command:
   ```bash
   docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.17.0
   ```
3. Verify Elasticsearch is running by accessing `http://localhost:9200` in your browser or using curl:
   ```bash
   curl http://localhost:9200
   ```
   You should see a JSON response with Elasticsearch information.


### Backend Setup (SailsJS)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the SailsJS server:
   ```bash
   sails lift
   ```
   The backend will run on port 1337 by default (http://localhost:1337).

### Frontend Setup (React)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on port 5173 by default (http://localhost:5173).

## Features

- **User Authentication**: Register, login, and protected routes
- **Product Management**: Add, edit, delete, and view products
- **Search**: Search products using Elasticsearch
- **Dark Mode**: Toggle between light and dark themes
- **Pagination**: Navigate through product listings with pagination

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get authentication token

### Products (Protected Routes)

- `GET /api/auth/products` - Get all products
- `GET /api/auth/products/:id` - Get a specific product
- `POST /api/auth/products` - Create a new product
- `PUT /api/auth/products/:id` - Update a product
- `DELETE /api/auth/products/:id` - Delete a product

### Search

- `GET /api/search/products` - Search products using Elasticsearch

## Usage

1. Register a new account or login with an existing one.
2. Once logged in, you can add, edit, and delete products.
3. Use the search bar to find products quickly.
4. Toggle between light and dark mode using the theme button in the header.



