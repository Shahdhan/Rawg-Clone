# Git Workflow Documentation

## Overview

Features for this project are developed in dedicated feature branches following a professional Git workflow, keeping the `master` branch clean and stable.

## Current Branch

```
feature/recommendations
```

## Steps Followed

### 1. Created Feature Branch

```bash
git checkout -b feature/recommendations
```

This created a new branch from `master` to develop the recommendations, social, and profile features without affecting the main codebase.

### 2. Development Commits

Multiple commits were made during development:

```bash
git commit -m "feat: complete game discovery platform"
git commit -m "add weekly recommendation email and unsubscribe feature"
```

### 3. Squashing Commits

Before merging, all commits are squashed into a single clean commit using interactive rebase:

```bash
git rebase -i HEAD~3
```

In the editor, the first commit is kept as `pick` and the rest changed to `squash`. The final commit message is set to:

```
feat: recommendations, social follow system, and public profiles
```

### 4. Force Push

After squashing, a force push is required to update the remote branch:

```bash
git push --force-with-lease origin feature/recommendations
```

### 5. Pull Request

A PR is created on GitHub to merge `feature/recommendations` into `master` with a description of all features added.

## Why Squashing?

Squashing combines multiple work-in-progress commits into one clean commit. This keeps the git history readable — each feature branch results in exactly one commit on `master`, making it easy to understand what was added and to revert if needed.
