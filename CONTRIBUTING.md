# Contributing to Peer Care Connect / Theramate

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Supabase account (for backend development)
- Stripe account (for payment features)

### Initial Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/peer-care-connect.git
   cd peer-care-connect
   ```

2. **Install dependencies**
   ```bash
   # For main project
   cd peer-care-connect
   npm install
   
   # For other sub-projects as needed
   cd ../ai-ugc-creator
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example file
   cp env.production.example .env.local
   
   # Fill in your environment variables
   # See ENVIRONMENT_SETUP_GUIDE.md for details
   ```

4. **Set up the database**
   - Follow instructions in `peer-care-connect/README.md`
   - Run migrations in order

5. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Creating a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(booking): add recurring session support

fix(payment): resolve Stripe webhook validation issue

docs(readme): update installation instructions
```

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types or `unknown`
- Enable strict mode in `tsconfig.json`

### Code Style

- Use ESLint and Prettier (configured in project)
- Run `npm run lint` before committing
- Follow existing code patterns
- Use meaningful variable and function names

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # Utility functions and API clients
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
├── types/         # TypeScript type definitions
└── __tests__/     # Test files
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test:all

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:unit:coverage
```

### Writing Tests

- Write tests for all new features
- Maintain or improve test coverage
- Follow existing test patterns
- Test user behavior, not implementation details

See `TESTING_GUIDE.md` for detailed testing guidelines.

## Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run tests** and ensure they pass
4. **Run linter** and fix any issues
5. **Update CHANGELOG.md** (if applicable)

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Environment variables documented (if new ones added)
- [ ] No secrets or sensitive data committed

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. PRs require at least one approval
2. All CI checks must pass
3. Address review comments promptly
4. Maintainers will merge after approval

## Project Structure

### Main Projects

- **peer-care-connect/** - Main therapy platform (React + Vite + Supabase)
- **ai-ugc-creator/** - AI video generation tool (Next.js + InstantDB)
- **theramate-ios-client/** - iOS mobile application

### Key Directories

- `src/` - Source code
- `supabase/` - Database migrations and Edge Functions
- `tests/` - Test files
- `docs/` - Documentation
- `public/` - Static assets

## Getting Help

- Check existing documentation in `docs/`
- Review existing issues and PRs
- Ask questions in discussions or issues
- Contact maintainers for urgent issues

## Additional Resources

- [README.md](./README.md) - Project overview
- [TESTING_GUIDE.md](./peer-care-connect/TESTING_GUIDE.md) - Testing guidelines
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [ENVIRONMENT_SETUP_GUIDE.md](./ENVIRONMENT_SETUP_GUIDE.md) - Environment setup

---

Thank you for contributing! 🎉
