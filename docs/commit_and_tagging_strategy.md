# Commit and Tagging Strategy

## Commit Guidelines

1. **Frequent Commits**
   - Aim to commit changes every 30 minutes or after completing a logical unit of work.
   - This practice ensures changes are regularly saved and can be easily tracked.

2. **AI Intervention Annotation**
   - If the commit includes changes made with AI assistance, annotate the commit message with the `ai:` prefix.
   - Example: `git commit -m "ai: Added new feature for user authentication"`

## Checkpoint Tagging Before Risky Operations

1. **Tagging Protocol**
   - Before performing risky operations such as rebasing, create a lightweight checkpoint tag.
   - Use the naming convention `checkpoint/*` to indicate these are temporary safety points.

2. **Creating and Pushing Tags**
   - Create a tag: `git tag checkpoint/my-checkpoint-description`
   - Push it to the remote: `git push origin checkpoint/my-checkpoint-description`

3. **When to Use Checkpoint Tags**
   - Before major refactoring
   - Before merges that could lead to complex conflicts
   - When in doubt, err on the side of caution and create a checkpoint tag.
