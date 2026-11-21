# Spec Delta

## Purpose

Defines workspace configuration, cross-package dependency resolution, root-level build and test script orchestration, and shared TypeScript configuration across the monorepo.

## ADDED Requirements

### Requirement: Workspace Package Management
The repository SHALL configure package workspaces in the root `package.json` to link applications under `apps/*` and libraries under `packages/*`.

#### Scenario: Resolving internal dependencies
- **WHEN** an application in `apps/` declares a dependency on `@certiflow/shared`
- **THEN** the package manager resolves the dependency directly from `packages/shared` without external registry requests.

### Requirement: Unified Script Orchestration
The root `package.json` SHALL define unified scripts to build, test, lint, and run development processes across all workspace projects.

#### Scenario: Executing workspace development processes
- **WHEN** a developer executes `npm run dev` at the repository root
- **THEN** development runtimes for both frontend and backend start concurrently without manual directory navigation.

### Requirement: Shared TypeScript Configuration
The repository SHALL provide a root base TypeScript configuration file (`tsconfig.base.json`) that enforces strict type-checking and module resolution.

#### Scenario: Compiling workspace projects
- **WHEN** `npm run build` is executed across workspace packages
- **THEN** each project compiles using compiler options inherited from the shared root configuration.

### Requirement: Shared Module Consumption
The workspace SHALL expose `@certiflow/shared` exports containing domain types, constants, and validation schemas accessible to full-stack applications.

#### Scenario: Importing shared schemas in backend or frontend
- **WHEN** application code imports validators or types from `@certiflow/shared`
- **THEN** the TypeScript compiler and runtime bundlers successfully resolve the module imports without module resolution errors.
