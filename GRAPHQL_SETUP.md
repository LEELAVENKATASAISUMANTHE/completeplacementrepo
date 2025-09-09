# GraphQL Setup Documentation

## Overview

This project now has a GraphQL setup integrated with your Express server for **read-only data retrieval**. The GraphQL endpoint is available at `/graphql` and provides flexible queries for fetching users, roles, and permissions. For data modifications (create, update, delete), continue using your existing REST API endpoints.

## Setup Components

### 1. Dependencies Installed
- `@apollo/server` - Apollo Server for GraphQL
- `graphql` - GraphQL JavaScript implementation
- `graphql-http` - GraphQL over HTTP for Express integration
- `@graphql-tools/schema` - Schema building utilities
- `@graphql-tools/load-files` - File loading utilities

### 2. File Structure
```
db/
├── graphql-server.js  # GraphQL server configuration
├── typedefs.js        # GraphQL schema definitions
├── resolvers.js       # GraphQL resolvers
```

### 3. Integration Points
- **app.js**: Added GraphQL handler to Express app
- **index.js**: Server startup with GraphQL integration
- **GRAPHQL_QUERIES.md**: Example queries and mutations

## GraphQL Schema

### Types
- **User**: Represents a user with name, email, and role
- **Role**: Represents a role with permissions
- **Permission**: Represents a permission that can be assigned to roles
- **UserSession**: Represents user sessions

### Queries
- `users` - Get all users
- `user(id)` - Get user by ID
- `roles` - Get all roles
- `role(id)` - Get role by ID
- `permissions` - Get all permissions
- `permission(id)` - Get permission by ID
- `sessions` - Get all sessions
- `session(id)` - Get session by ID

### Data Modifications
For creating, updating, or deleting data, use your existing REST API endpoints:
- **Users**: `/api/users` (POST, PUT, DELETE)
- **Roles**: `/api/roles` (POST, PUT, DELETE) 
- **Permissions**: `/api/permissions` (POST, PUT, DELETE)
- **Role-Permissions**: `/api/role-permissions` (POST, DELETE)

This separation provides:
- GraphQL for complex, flexible data queries
- REST API for data modifications with proper validation

## Accessing GraphQL

### GraphiQL Playground
Visit `http://localhost:3000/graphql` in your browser to access the GraphiQL playground where you can:
- Write and test GraphQL queries
- Explore the schema documentation
- See autocomplete suggestions

### Programmatic Access
Make HTTP POST requests to `http://localhost:3000/graphql` with:
```json
{
  "query": "your GraphQL query here",
  "variables": {
    "variable1": "value1"
  }
}
```

## Database Integration

The GraphQL resolvers are connected to your PostgreSQL database using the existing connection pool from `setup.db.js`. They support:

- **Relationships**: Automatic resolution of related data (user roles, role permissions, etc.)
- **Error Handling**: Comprehensive error catching and reporting
- **SQL Injection Protection**: Using parameterized queries

## Authentication Context

The GraphQL context includes:
- `req` - Express request object
- `res` - Express response object  
- `user` - Current user from session (if authenticated)

You can extend this context for authentication and authorization logic.

## Example Usage

### Query Example
```javascript
// Frontend JavaScript example
const query = `
  query {
    users {
      id
      name
      email
      role {
        name
        permissions {
          name
        }
      }
    }
  }
`;

fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### REST API Example for Data Modification
```javascript
// Create a new user using REST API
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com", 
    roleId: "1"
  }),
})
.then(response => response.json())
.then(data => console.log(data));

// Then query the updated data using GraphQL
const query = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role {
        name
        permissions {
          name
        }
      }
    }
  }
`;

fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    query,
    variables: { id: data.id }
  }),
})
.then(response => response.json())
.then(userData => console.log(userData));
```

## Production Considerations

1. **Security**: Add proper authentication and authorization
2. **Rate Limiting**: Consider GraphQL-specific rate limiting
3. **Query Complexity**: Add query complexity analysis
4. **Caching**: Implement caching strategies
5. **Monitoring**: Add GraphQL-specific monitoring
6. **CORS**: The current CORS settings allow your frontend domains

## Next Steps

1. Test queries in the GraphiQL playground
2. Use GraphQL for complex data retrieval in your frontend
3. Continue using REST API endpoints for data modifications
4. Add authentication middleware to GraphQL queries if needed
5. Consider adding pagination and filtering to GraphQL queries
6. Set up proper error logging and monitoring
