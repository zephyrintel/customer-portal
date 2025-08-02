# Branch Creation Conventions

## Git Aliases

Two git aliases have been set up to streamline the creation of feature and ai-experiment branches:

1. **Feature Branches**:
   - Alias: `feature`
   - Command: `git feature <branch-name>`
   - Description: Creates a new branch prefixed with `feature/` from `dev` branch.
   
   ```bash
   git config --add alias.feature '!f(){ git checkout -b feature/$1 dev; }; f'
   ```

2. **AI Experiment Branches**:
   - Alias: `aix`
   - Command: `git aix <branch-name>`
   - Description: Creates a new branch prefixed with `ai-experiments/` followed by the date and the provided name from `dev` branch.
   
   ```bash
   git config --add alias.aix '!f(){ git checkout -b ai-experiments/$(date +%Y%m%d)-$1 dev; }; f'
   ```

## Merge Practices

- **Feature Branches**:
  - Target: `dev`
  - Merge Strategy: Squash and merge

- **AI Experiment Branches**:
  - Target: `dev`
  - Merge Strategy: Rebase or create a Pull Request (PR)
  - Additional: Use periodic tags in the format `backup/*` to save progress.

Ensure all branches are up to date with the `dev` branch before opening a PR or rebasing.
