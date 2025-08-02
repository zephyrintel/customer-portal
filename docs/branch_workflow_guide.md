# Branch Workflow Guide

## Overview

This guide outlines the workflow for creating and managing feature branches and AI experiment branches in our development process.

## Branch Types and Naming Conventions

### Feature Branches
- **Pattern**: `feature/<descriptive-name>`
- **Purpose**: Development of new features, bug fixes, and general improvements
- **Source**: Always branch from `dev`
- **Target**: Merge back to `dev`

### AI Experiment Branches
- **Pattern**: `ai-experiments/YYYYMMDD-<descriptive-name>`
- **Purpose**: AI/ML experiments, proof of concepts, research work
- **Source**: Always branch from `dev`
- **Target**: Merge back to `dev`

## Quick Start

### Creating Branches

```bash
# Create a feature branch
git feature user-authentication
# This creates: feature/user-authentication

# Create an AI experiment branch
git aix sentiment-analysis
# This creates: ai-experiments/20241215-sentiment-analysis
```

### Typical Workflow

1. **Start from dev**:
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Create your branch**:
   ```bash
   git feature my-new-feature
   # or
   git aix my-experiment
   ```

3. **Work on your changes**:
   ```bash
   # Make your changes
   git add .
   git commit -m "Add new functionality"
   ```

4. **Push your branch**:
   ```bash
   git push origin feature/my-new-feature
   # or
   git push origin ai-experiments/20241215-my-experiment
   ```

## Merge Strategies

### Feature Branches → dev
- **Strategy**: Squash and merge
- **Why**: Keeps the dev branch history clean with single commits per feature
- **Command**: 
  ```bash
  git checkout dev
  git merge --squash feature/my-new-feature
  git commit -m "Add my new feature"
  ```

### AI Experiment Branches → dev
- **Strategy**: Rebase or Pull Request
- **Why**: Preserves experiment history while keeping integration clean
- **Options**:
  
  **Option 1: Rebase**
  ```bash
  git checkout ai-experiments/20241215-my-experiment
  git rebase dev
  git checkout dev
  git merge ai-experiments/20241215-my-experiment
  ```
  
  **Option 2: Pull Request**
  - Create a PR from your experiment branch to dev
  - Review and merge through your Git hosting platform

## Backup Strategy for AI Experiments

### Periodic Tags
Create backup tags to preserve important experiment states:

```bash
# Create a backup tag
git tag backup/ai-experiments/20241215-my-experiment-v1
git push origin backup/ai-experiments/20241215-my-experiment-v1

# List backup tags
git tag -l "backup/*"
```

### When to Create Backup Tags
- Before major refactoring
- After successful experiment iterations
- Before merging to dev
- Weekly for long-running experiments

## Best Practices

### General
1. Always ensure your `dev` branch is up-to-date before creating new branches
2. Use descriptive branch names that clearly indicate the purpose
3. Keep branches focused on a single feature or experiment
4. Regular commits with clear messages

### Feature Branches
1. Keep features small and focused
2. Test thoroughly before merging
3. Update documentation as needed
4. Clean up local branches after merging

### AI Experiment Branches
1. Document experiment goals and results
2. Include performance metrics and findings
3. Create backup tags for significant milestones
4. Consider creating experiment reports before merging

## Cleanup Commands

```bash
# Delete local branch after merging
git branch -d feature/my-feature

# Delete remote branch
git push origin --delete feature/my-feature

# Clean up merged branches
git branch --merged dev | grep -v "dev\|main\|master" | xargs -n 1 git branch -d
```

## Troubleshooting

### Branch Already Exists
```bash
# If branch name conflicts, use a more specific name
git feature user-auth-v2
git aix model-training-improved
```

### Switching Base Branch
```bash
# If you need to change the base branch
git rebase --onto new-base old-base your-branch
```

### Recovering from Backup Tags
```bash
# Restore from a backup tag
git checkout backup/ai-experiments/20241215-my-experiment-v1
git checkout -b ai-experiments/20241215-my-experiment-restored
```
