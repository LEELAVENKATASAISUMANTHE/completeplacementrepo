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
    roleId: ID
    roleName: String
  }

  type Job {
    id: ID!
    company_id: ID!
    title: String!
    description: String!
    req_skills: [String!]!
    salary_range: String!
    start_date: String!
    end_date: String!
    location: String!
    is_active: Boolean!
    created_at: String!
    updated_at: String
    company: Company!
  }

  input JobInput {
    company_id: ID!
    title: String!
    description: String!
    req_skills: [String!]!
    salary_range: String!
    start_date: String!
    end_date: String!
    location: String!
    is_active: Boolean!
  }

  input JobSearchInput {
    id: ID
    company_id: ID
    title: String
    location: String
    is_active: Boolean
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
  type Company {
    id: ID!
    name: String!
    email: String!
    logo: String!
    description: String!
    headquarters: [String!]!
    sub_branch_location: [String!]
    created_at: String!
    updated_at: String!
    users: [User!]
    jobs: [Job!]
  }

  input CompanySearchInput {
    id: Int
    name: String
    email: String
    description: String
    headquarters: String
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
    companies: [Company!]!
    company(id: ID!): Company
    searchCompanies(by: CompanySearchInput): [Company]
    jobs: [Job!]!
    job(id: ID!): Job
    searchJob(by: JobSearchInput): [Job]
  }
`;
export default typeDefs;  