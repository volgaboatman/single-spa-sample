# Setup GitHub Repository

## Option 1: Create Repository via GitHub Website (Recommended)

1. Go to https://github.com/new
2. Repository name: `single-spa-sample`
3. Description: `Single-spa microfrontend application with dynamic child app support`
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

Then run these commands:

```bash
git remote add origin https://github.com/volgaboatman/single-spa-sample.git
git branch -M main
git push -u origin main
```

## Option 2: Create Repository via GitHub API (if you have a token)

If you have a GitHub personal access token, you can create the repository via API:

```bash
# Set your GitHub token (replace YOUR_TOKEN with your actual token)
$env:GITHUB_TOKEN = "YOUR_TOKEN"

# Create the repository
curl -X POST `
  -H "Authorization: token $env:GITHUB_TOKEN" `
  -H "Accept: application/vnd.github.v3+json" `
  https://api.github.com/user/repos `
  -d '{"name":"single-spa-sample","description":"Single-spa microfrontend application with dynamic child app support","private":false}'

# Add remote and push
git remote add origin https://github.com/volgaboatman/single-spa-sample.git
git branch -M main
git push -u origin main
```

## Option 3: Use GitHub CLI (if installed)

```bash
gh repo create single-spa-sample --public --description "Single-spa microfrontend application with dynamic child app support" --source=. --remote=origin --push
```

