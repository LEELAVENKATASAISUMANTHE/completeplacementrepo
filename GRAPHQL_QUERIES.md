# GraphQL Test Queries

## Basic Queries

### Get all users
```graphql
query {
  users {
    id
    name
    email
    created_at
    role {
      id
      name
      description
      permissions {
        id
        name
        description
      }
    }
  }
}
```

### Get single user by ID
```graphql
query {
  user(id: "1") {
    id
    name
    email
    role {
      name
      permissions {
        name
      }
    }
    sessions {
      id
      created_at
    }
  }
}
```

### Get all roles with permissions
```graphql
query {
  roles {
    id
    name
    description
    isActive
    permissions {
      id
      name
      description
    }
    users {
      id
      name
      email
    }
  }
}
```

### Get all permissions with roles
```graphql
query {
  permissions {
    id
    name
    description
    roles {
      id
      name
      description
    }
  }
}
```

### Get all sessions
```graphql
query {
  sessions {
    id
    created_at
    user {
      id
      name
      email
    }
  }
}
```

## Combined Query Example
```graphql
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
  roles {
    id
    name
    isActive
  }
  permissions {
    id
    name
  }
}
```

## Note on Data Modifications

GraphQL in this project is configured for **read-only operations**. For creating, updating, or deleting data, use the existing REST API endpoints in `/api` routes.

This approach provides:
- GraphQL for flexible data retrieval and complex queries
- REST API for data modifications with proper validation and business logic
- Clear separation of concerns between read and write operations
