# Spec Delta

## Purpose

Defines the frontend single-page application bootstrap, role-oriented routing structure, shared application shells, and typed API communication layer with TanStack Query.

## ADDED Requirements

### Requirement: Role-Scoped Route Architecture
The frontend application SHALL establish route hierarchies structured around primary administrative and stakeholder roles: authentication, training centre, district, quality, state, and verification.

#### Scenario: Navigating to role-scoped pages
- **WHEN** a user navigates to any role-scoped path such as `/training-centre`, `/district`, `/quality`, `/state`, or `/verification`
- **THEN** the router mounts the designated role page view and its layout hierarchy.

### Requirement: Enterprise Application Shell Layout
The frontend application SHALL provide an enterprise application shell featuring a role-aware collapsible sidebar, top navigation bar with breadcrumbs, notifications area, and user profile session menu.

#### Scenario: Rendering authenticated workspace shell
- **WHEN** an authenticated user accesses any internal role page
- **THEN** the application shell renders the top navigation, active breadcrumbs, and role-scoped navigation sidebar.

### Requirement: Minimalist Public Verification Shell
The frontend application SHALL provide an unauthenticated, mobile-optimized standalone layout dedicated to public certificate verification without administrative navigation sidebars.

#### Scenario: Navigating to public verification route
- **WHEN** a user accesses the public verification route
- **THEN** the application displays a streamlined single-card verification interface with zero administrative controls.

### Requirement: Centralized API Service Client
The frontend application SHALL implement a centralized HTTP service client configured to communicate with the backend API using environment-driven base URLs.

#### Scenario: Making backend API requests
- **WHEN** a frontend feature service dispatches an API request
- **THEN** the HTTP client automatically prefixes requests with the configured backend base URL and handles common response envelopes.

### Requirement: Centralized Server-State Management with TanStack Query
The frontend application SHALL manage all asynchronous server-state fetching, caching, synchronization, and mutations using TanStack Query with a centralized QueryClientProvider.

#### Scenario: Fetching server entities with useQuery
- **WHEN** a page component requests server entities using useQuery
- **THEN** TanStack Query executes the request through the centralized API client, manages loading/error states, and caches the result.

### Requirement: Feature-Oriented Query Keys and Targeted Invalidation
The frontend application SHALL organize query keys using hierarchical factory functions and perform targeted cache invalidation after successful state mutations.

#### Scenario: Invalidating cache upon mutation success
- **WHEN** a state-changing mutation executes successfully via useMutation
- **THEN** TanStack Query invalidates the corresponding query key family and refetches active queries.

### Requirement: Authentication-Aware Cache Lifecycle and Stale Request Cancellation
The frontend application SHALL purge all cached query data upon user logout and cancel in-flight HTTP requests via AbortSignal when parameters change.

#### Scenario: Purging cache on authentication logout
- **WHEN** a user logs out of the application
- **THEN** the application invokes queryClient.clear() to purge all cached server data from client memory.

### Requirement: Form Management with React Hook Form and Zod
The frontend application SHALL manage form state using React Hook Form paired with `@hookform/resolvers/zod` utilizing validation schemas from `@certiflow/shared`.

#### Scenario: Validating form inputs on submission
- **WHEN** a user submits a form with invalid field data
- **THEN** the form resolver intercepts submission and displays field-level validation errors without dispatching API requests.

### Requirement: Environment-Driven Frontend Configuration
The frontend application SHALL read configuration parameters from environment variables prefixed with `VITE_` and provide fallbacks.

#### Scenario: Launching frontend with custom API endpoint
- **WHEN** the frontend application initializes with `VITE_API_URL` set in its environment
- **THEN** the application directs all service requests to the specified API URL.
