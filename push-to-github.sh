#!/bin/bash

# Script to push internship-automation-engine to GitHub
# Make sure you've created the repository on GitHub first!

echo "🚀 Pushing Internship Automation Engine to GitHub..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the internship-automation-engine directory"
    echo "Please run this script from the internship-automation-engine folder"
    exit 1
fi

# Prompt for GitHub token
echo "📝 Please enter your GitHub Personal Access Token:"
echo "   (Get it from: GitHub Settings → Developer settings → Personal access tokens)"
read -s GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GitHub token is required"
    exit 1
fi

# Configure Git for this repository
echo "🔧 Configuring Git..."
git config user.name "prsmstd"
git config user.email "team.prismstudios@gmail.com"

# Set remote URL with token
echo "🔗 Setting up remote repository..."
git remote set-url origin https://prsmstd:$GITHUB_TOKEN@github.com/prsmstd/autointernship-automation-engine.git

# Add all files and commit if needed
echo "📦 Preparing files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No new changes to commit"
else
    echo "📝 Committing new changes..."
    git commit -m "Update internship automation engine with latest features"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push -u origin main; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository URL: https://github.com/prsmstd/autointernship-automation-engine"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check:"
    echo "1. Repository exists on GitHub"
    echo "2. Personal access token is correct"
    echo "3. Token has 'repo' permissions"
    exit 1
fi

echo "🎉 Done! Your internship automation engine is now on GitHub!"