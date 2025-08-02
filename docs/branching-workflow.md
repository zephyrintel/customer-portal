# Branching Workflow Guide

## Branch Purpose Diagram

```
main/master
│
├── develop ──────────────────────────────── (integration branch)
│   │
│   ├── feature/user-authentication ──────── (feature development)
│   ├── feature/maintenance-scheduler ────── (feature development)
│   ├── feature/dashboard-improvements ──── (feature development)
│   │
│   ├── release/v2.1.0 ───────────────────── (release preparation)
│   │   └── release/v2.1.0-rc1 ──────────── (release candidate)
│   │
│   └── hotfix/critical-security-patch ──── (urgent production fixes)
│
└── production/staging ──────────────────── (pre-production testing)
```

### Branch Types & Purposes

- **`main/master`**: Production-ready code, always deployable
- **`develop`**: Integration branch for ongoing development
- **`feature/*`**: New features and enhancements
- **`release/*`**: Release preparation and version stabilization
- **`hotfix/*`**: Critical fixes for production issues
- **`bugfix/*`**: Non-critical bug fixes
- **`docs/*`**: Documentation updates
- **`chore/*`**: Maintenance tasks, dependency updates
- **`experiment/*`**: Experimental features (may be discarded)

## Step-by-Step Cheat Sheet

### 🚀 Creating a New Feature Branch

```bash
# 1. Switch to develop and get latest changes
git checkout develop
git pull origin develop

# 2. Create and switch to new feature branch
git checkout -b feature/your-feature-name

# 3. Push branch to remote (set upstream)
git push -u origin feature/your-feature-name
```

### 🔄 Daily Development Workflow

```bash
# 1. Start of day - sync with develop
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git merge develop  # or git rebase develop

# 2. Make your changes and commit
git add .
git commit -m "feat: implement user authentication logic"

# 3. Push changes
git push origin feature/your-feature-name

# 4. End of day - push any remaining work
git add .
git commit -m "wip: save progress on authentication flow"
git push origin feature/your-feature-name
```

### 🎯 Merging Features

```bash
# 1. Ensure feature is up to date with develop
git checkout feature/your-feature-name
git fetch origin
git merge origin/develop

# 2. Run tests and ensure everything works
npm test  # or your test command
npm run build  # ensure build passes

# 3. Create Pull Request via GitHub/GitLab
# OR merge directly if permitted:
git checkout develop
git merge --no-ff feature/your-feature-name
git push origin develop

# 4. Clean up feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### 🆘 Hotfix Process

```bash
# 1. Create hotfix from main/master
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue-fix

# 2. Make the fix and test thoroughly
git add .
git commit -m "fix: resolve critical security vulnerability"

# 3. Merge into main AND develop
git checkout main
git merge --no-ff hotfix/critical-issue-fix
git tag -a v1.2.1 -m "Hotfix release v1.2.1"
git push origin main --tags

git checkout develop
git merge --no-ff hotfix/critical-issue-fix
git push origin develop

# 4. Clean up
git branch -d hotfix/critical-issue-fix
git push origin --delete hotfix/critical-issue-fix
```

### 🗂️ Backup Strategies

```bash
# 1. Create backup branch before risky operations
git checkout -b backup/feature-name-$(date +%Y%m%d)
git push -u origin backup/feature-name-$(date +%Y%m%d)

# 2. Tag important milestones
git tag -a milestone-v1.0-beta -m "Beta release milestone"
git push origin --tags

# 3. Archive completed features
git tag -a archive/feature-name -m "Archive completed feature"
git push origin --tags
git branch -d feature/feature-name
```

### 🧹 Cleanup Commands

```bash
# 1. List merged branches (safe to delete)
git branch --merged develop

# 2. Delete local merged branches
git branch --merged develop | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# 3. Delete remote tracking branches that no longer exist
git remote prune origin

# 4. Clean up tags
git tag -l | grep -E "^(backup|temp|test)" | xargs git tag -d
git push origin --delete $(git tag -l | grep -E "^(backup|temp|test)")

# 5. Interactive cleanup of stale branches
git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads | sort -k2 -r
```

## CI/Pre-commit Overview

### Pre-commit Hooks Setup

```bash
# Install pre-commit
npm install --save-dev husky lint-staged

# Add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,md}": ["prettier --write"],
    "*.{json,yaml,yml}": ["prettier --write"]
  }
}
```

### CI/CD Pipeline Stages

```yaml
# Example GitHub Actions workflow
name: CI/CD Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Build application
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging environment"

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: echo "Deploy to production environment"
```

### Branch Protection Rules

- **Main/Master Branch**:
  - Require pull request reviews (2+ approvals)
  - Require status checks to pass
  - Require branches to be up to date
  - Include administrators in restrictions

- **Develop Branch**:
  - Require pull request reviews (1+ approval)
  - Require status checks to pass
  - Allow force pushes for maintainers only

## FAQ & Troubleshooting

### ❓ Frequently Asked Questions

**Q: How do I sync my feature branch with the latest develop changes?**
```bash
git checkout feature/your-branch
git fetch origin
git merge origin/develop
# OR for a cleaner history:
git rebase origin/develop
```

**Q: I accidentally committed to the wrong branch. How do I move the commits?**
```bash
# Move last N commits to a new branch
git checkout wrong-branch
git checkout -b correct-branch
git checkout wrong-branch
git reset --hard HEAD~N  # N = number of commits to move
```

**Q: How do I undo the last commit but keep my changes?**
```bash
git reset --soft HEAD~1  # Keeps changes staged
# OR
git reset HEAD~1         # Keeps changes unstaged
```

**Q: My branch diverged from develop. How do I fix it?**
```bash
# Option 1: Merge (preserves history)
git checkout your-branch
git merge develop

# Option 2: Rebase (cleaner history)
git checkout your-branch
git rebase develop

# If conflicts occur during rebase:
# 1. Resolve conflicts in files
# 2. git add resolved-files
# 3. git rebase --continue
```

**Q: How do I partially commit changes from a file?**
```bash
git add -p filename  # Interactive staging
# OR
git add --patch filename
```

### 🔄 Rollback Recipes

#### Rollback Last Commit (Not Pushed)
```bash
git reset --soft HEAD~1  # Keep changes staged
git reset HEAD~1         # Keep changes unstaged
git reset --hard HEAD~1  # Discard changes completely
```

#### Rollback Pushed Commits
```bash
# Create a revert commit (safe for shared branches)
git revert HEAD          # Revert last commit
git revert HEAD~2..HEAD  # Revert last 2 commits

# Force reset (dangerous - only for unshared branches)
git reset --hard HEAD~1
git push --force-with-lease origin branch-name
```

#### Rollback a Merge
```bash
# If merge hasn't been pushed
git reset --hard HEAD~1

# If merge has been pushed
git revert -m 1 HEAD  # Revert to first parent (usually main branch)
```

#### Rollback to Specific Commit
```bash
# View commit history
git log --oneline

# Reset to specific commit
git reset --hard commit-hash

# If already pushed (creates revert commits)
git revert commit-hash..HEAD
```

#### Emergency Production Rollback
```bash
# 1. Quickly rollback to last known good commit
git checkout main
git reset --hard last-good-commit-hash
git push --force-with-lease origin main

# 2. Create hotfix branch for proper fix
git checkout -b hotfix/rollback-emergency-fix

# 3. Tag the rollback for tracking
git tag -a emergency-rollback-$(date +%Y%m%d-%H%M) -m "Emergency rollback"
git push origin --tags
```

#### Recover Deleted Branch
```bash
# Find the commit hash of the deleted branch
git reflog

# Recreate the branch
git checkout -b recovered-branch commit-hash
```

#### Rollback Configuration Files
```bash
# Restore specific file from last commit
git checkout HEAD -- path/to/file

# Restore file from specific commit
git checkout commit-hash -- path/to/file

# Restore all files from last commit (dangerous!)
git checkout HEAD -- .
```

### 🚨 Emergency Procedures

#### Code Freeze Protocol
```bash
# 1. Create emergency branch from main
git checkout main
git checkout -b emergency/code-freeze-$(date +%Y%m%d)

# 2. Notify team and lock branches
# (Use branch protection rules or communication)

# 3. Only allow hotfix branches
git checkout -b hotfix/critical-fix-only
```

#### Disaster Recovery
```bash
# 1. Clone fresh repository
git clone <repository-url> disaster-recovery

# 2. Check available backups
git branch -r
git tag -l

# 3. Restore from backup branch or tag
git checkout backup/production-$(date +%Y%m%d)
# OR
git checkout tags/stable-release-v1.0
```

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Create feature branch | `git checkout -b feature/name` |
| Switch branches | `git checkout branch-name` |
| List branches | `git branch -a` |
| Delete local branch | `git branch -d branch-name` |
| Delete remote branch | `git push origin --delete branch-name` |
| Merge branch | `git merge branch-name` |
| Rebase branch | `git rebase branch-name` |
| Stash changes | `git stash` |
| Apply stash | `git stash pop` |
| View commit history | `git log --oneline --graph --all` |
| Show file changes | `git diff` |
| Undo last commit | `git reset --soft HEAD~1` |
| Force push (dangerous) | `git push --force-with-lease` |

---

*Last updated: $(date +%Y-%m-%d)*
*For questions or improvements to this workflow, please create an issue or submit a pull request.*
