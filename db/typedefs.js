import { ApolloServer } from "@apollo/server";
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    created_at: String!
    updated_at: String!
    sessions: [UserSession!]
  }
  input usersearch {
    id: ID
    email: String
    name: String
    role: ID
  }
  type Role {
    id: ID!
    name: String!
    description: String
    isActive: Boolean!
    created_at: String!
    updated_at: String!
    permissions: [Permission!]
    users: [User!]
  }

  type Permission {
    id: ID!
    name: String!
    description: String!
    created_at: String!
    updated_at: String!
    roles: [Role!]
  }

  type UserSession {
    id: ID!
    user: User!
    created_at: String!
    updated_at: String!
  }

  type Query {
    searchUsers(by: usersearch): [User]
    users: [User!]!
    user(id: ID!): User
    roles: [Role!]
    role(id: ID!): Role
    permissions: [Permission!]
    permission(id: ID!): Permission
    sessions: [UserSession!]
    session(id: ID!): UserSession
  }
`;
export default typeDefs;  