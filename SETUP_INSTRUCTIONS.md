# Setup Instructions - Post GitHub Readiness

This document provides instructions for completing the GitHub setup after all readiness files have been created.

## Pre-Publication Checklist

### 1. Update Repository Information

Edit the following files with your actual repository information:

#### `package.json`
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-USERNAME/YOUR-REPO.git"
  }
}
```

#### `SECURITY.md`
- Update email: `security@peercareconnect.com` → Your security email
- Update GitHub Security Advisories link

#### `CODE_OF_CONDUCT.md`
- Update email: `conduct@peercareconnect.com` → Your conduct email

#### `README.md`
- Update GitHub links (issues, discussions)
- Update repository clone URL

### 2. Security Audit

**CRITICAL:** Before pushing to GitHub, audit your git history for secrets:

```bash
# Option 1: Using git-secrets
git-secrets --scan-history

# Option 2: Using truffleHog
trufflehog git file://. --json

# Option 3: Manual search
git log --all --full-history --source -S "sk_live_" 
git log --all --full-history --source -S "sk_test_"
```

**If secrets are found:**
1. Rotate all exposed keys immediately
2. Consider using `git-filter-repo` to remove from history
3. Or start fresh with a new repository

### 3. Configure GitHub Repository

#### Create Repository
1. Go to GitHub and create a new repository
2. **DO NOT** initialize with README, .gitignore, or license (we have these)
3. Copy the repository URL

#### Initial Push
```bash
# If this is a new repository
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main

# If you have existing commits
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 4. Set Up GitHub Secrets

For CI/CD to work, configure these secrets in GitHub:

**Repository Settings → Secrets and variables → Actions**

Required secrets:
- `TEST_SUPABASE_URL` - Test Supabase project URL
- `TEST_SUPABASE_ANON_KEY` - Test Supabase anon key
- `TEST_SUPABASE_SERVICE_ROLE_KEY` - Test service role key

Optional (for deployments):
- `VERCEL_TOKEN` - If using Vercel
- `SUPABASE_ACCESS_TOKEN` - For Supabase deployments

### 5. Enable GitHub Features

#### Branch Protection
1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators

#### Security Features
1. **Dependabot**
   - Settings → Security → Dependabot
   - Enable Dependabot alerts
   - Enable Dependabot security updates

2. **Code Scanning**
   - Settings → Security → Code security and analysis
   - Enable CodeQL analysis (if desired)

3. **Secret Scanning**
   - Settings → Security → Secret scanning
   - Enable secret scanning (GitHub Advanced Security)

### 6. Set Up Pre-commit Hooks

```bash
# Install Husky
npm install

# This will set up pre-commit hooks automatically
# (configured in package.json "prepare" script)
```

### 7. Test CI/CD

1. Create a test branch:
   ```bash
   git checkout -b test/ci-pipeline
   ```

2. Make a small change (e.g., update README)

3. Push and create PR:
   ```bash
   git add .
   git commit -m "test: verify CI/CD pipeline"
   git push origin test/ci-pipeline
   ```

4. Create Pull Request on GitHub
5. Verify CI workflows run successfully

### 8. Organize Existing Documentation (Optional)

The project has 100+ markdown files in the root. Consider organizing:

```bash
# Create organized structure (example)
mkdir -p docs/legacy
# Move old documentation files
# Keep only essential files in root
```

**Priority files to keep in root:**
- README.md
- CONTRIBUTING.md
- LICENSE
- SECURITY.md
- CODE_OF_CONDUCT.md
- CHANGELOG.md
- .gitignore

### 9. Create Initial Issues

Create GitHub issues for:
- Known bugs
- Planned features
- Documentation improvements
- Technical debt

### 10. Set Up Project Board (Optional)

1. Go to Projects → New project
2. Create a board with columns:
   - Backlog
   - To Do
   - In Progress
   - In Review
   - Done

## Post-Publication Tasks

### Week 1
- [ ] Monitor CI/CD pipeline
- [ ] Review and merge any pending PRs
- [ ] Set up monitoring/analytics
- [ ] Create team onboarding guide

### Week 2
- [ ] Migrate documentation to organized structure
- [ ] Complete API documentation
- [ ] Set up code coverage reporting
- [ ] Configure deployment pipelines

### Ongoing
- [ ] Keep dependencies updated
- [ ] Review security advisories
- [ ] Update documentation
- [ ] Maintain CHANGELOG.md

## Verification

Before considering setup complete, verify:

- [ ] Repository is public/accessible
- [ ] All files pushed successfully
- [ ] CI/CD workflows run without errors
- [ ] Branch protection rules active
- [ ] Security features enabled
- [ ] Pre-commit hooks working
- [ ] Documentation accessible
- [ ] Team members have access

## Troubleshooting

### CI/CD Failures

**Issue:** Workflows fail with "secrets not found"
- **Solution:** Add required secrets in GitHub Settings

**Issue:** Tests fail in CI but pass locally
- **Solution:** Check environment variables, test database setup

### Pre-commit Hooks Not Running

**Issue:** Hooks don't run on commit
- **Solution:** 
  ```bash
  npm install
  # This runs the "prepare" script which sets up Husky
  ```

### Documentation Not Accessible

**Issue:** Links broken in documentation
- **Solution:** Update relative paths, verify file structure

## Support

If you encounter issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [GitHub Readiness Assessment](./GITHUB_READINESS_ASSESSMENT.md)
3. Check [Completion Report](./GITHUB_READINESS_COMPLETE.md)
4. Open an issue on GitHub

---

**Last Updated:** 2025-02-09
