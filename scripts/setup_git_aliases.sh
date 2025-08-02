#!/bin/bash

# Git Aliases Setup Script
# This script configures git aliases for branch creation conventions

echo "Setting up git aliases for branch creation..."

# Feature branch alias
echo "Adding 'feature' alias..."
git config --add alias.feature '!f(){ git checkout -b feature/$1 dev; }; f'

# AI experiments branch alias  
echo "Adding 'aix' alias..."
git config --add alias.aix '!f(){ git checkout -b ai-experiments/$(date +%Y%m%d)-$1 dev; }; f'

echo "Git aliases configured successfully!"
echo ""
echo "Usage:"
echo "  git feature <branch-name>    # Creates feature/<branch-name> from dev"
echo "  git aix <branch-name>        # Creates ai-experiments/YYYYMMDD-<branch-name> from dev"
echo ""
echo "Example:"
echo "  git feature user-auth        # Creates feature/user-auth"
echo "  git aix model-training       # Creates ai-experiments/20241215-model-training"
