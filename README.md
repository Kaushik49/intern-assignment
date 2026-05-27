# Internship Technical Assessment — NestJS Backend Application

This repository contains the backend starter application for the technical assessment / internship project. It is built using the [NestJS](https://nestjs.com/) framework and is pre-configured with a database connection manager, testing suites, and strict linting guidelines to evaluate development proficiency.

---

## 🛠️ Tech Stack & Tools

* **Backend Framework**: [NestJS](https://docs.nestjs.com/) (TypeScript-first Node.js framework)
* **Database Layer**: [TypeORM](https://typeorm.io) (via `data-source.ts`) for Object-Relational Mapping
* **Language**: TypeScript (98.9%)
* **Code Quality**: [ESLint](https://eslint.org) and [Prettier](https://prettier.io) for unified code styling

---

## 📁 Repository Structure

```text
├── src/                  # Main application source code
│   ├── app.module.ts     # Root module of the application
│   └── main.ts           # Entry point to bootstrap the server
├── test/                 # End-to-end (e2e) and integration tests
├── data-source.ts        # TypeORM data source configuration & migrations setup
├── eslint.config.mjs     # Strict code formatting and linting rules
├── .prettierrc           # Prettier rules configuration
├── nest-cli.json         # NestJS CLI configuration guidelines
└── tsconfig.json         # TypeScript compiler configurations
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org) (v18 or higher recommended)
* [NPM](https://npmjs.com) (bundled with Node)

### 2. Installation
Clone the repository and install the project dependencies:
```bash
git clone https://github.com
cd intern-assignment
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and configure your database variables required by `data-source.ts`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
PORT=3000
```

---

## 💻 CLI Commands

### Application Execution
Run the development server with hot-reloading active:
```bash
# Development mode
$ npm run start

# Watch mode (Recommended for development)
$ npm run start:dev

# Production build mode
$ npm run start:prod
```

### Database Migrations (TypeORM)
If database changes or migrations are needed, use these commands via the TypeORM CLI:
```bash
# Generate a migration file
$ npx typeorm-ts-node-commonjs migration:generate src/migrations/MigrationName -d data-source.ts

# Run pending migrations
$ npx typeorm-ts-node-commonjs migration:run -d data-source.ts
```

### Automated Testing
Execute the pre-configured test suites:
```bash
# Run unit tests
$ npm run test

# Run end-to-end (e2e) tests
$ npm run test:e2e

# Check code coverage
$ npm run test:cov
```

### Code Formatting & Quality
Ensure your code adheres to code quality guidelines before pushing changes:
```bash
# Lint code structure
$ npm run lint

# Format code with Prettier
$ npx prettier --write "src/**/*.ts"
```

---

## 📝 Submission Evaluation Rules

1. **Clean Code**: Follow NestJS modular design patterns (Controllers, Services, Modules).
2. **Type Safety**: Avoid using `any`; explicitly define interfaces, DTOs, and entity models.
3. **Database Integration**: Handle relational transactions efficiently via the designated TypeORM data-source.
