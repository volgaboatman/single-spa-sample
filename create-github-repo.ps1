# Script to create GitHub repository and push code
# Usage: .\create-github-repo.ps1

$repoName = "single-spa-sample"
$repoDescription = "Single-spa microfrontend application with dynamic child app support"
$username = "volgaboatman"
$repoUrl = "https://github.com/$username/$repoName"

Write-Host "Setting up GitHub repository: $repoName" -ForegroundColor Green

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove it and add the new one? (y/n)"
    if ($response -eq 'y') {
        git remote remove origin
    } else {
        Write-Host "Keeping existing remote. Exiting." -ForegroundColor Yellow
        exit
    }
}

# Try to create repository via GitHub API if token is available
$token = $env:GITHUB_TOKEN
if (-not $token) {
    $token = Read-Host "Enter your GitHub Personal Access Token (or press Enter to skip API creation)"
}

if ($token) {
    Write-Host "Creating repository via GitHub API..." -ForegroundColor Cyan
    $body = @{
        name = $repoName
        description = $repoDescription
        private = $false
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" `
            -Method Post `
            -Headers @{
                "Authorization" = "token $token"
                "Accept" = "application/vnd.github.v3+json"
            } `
            -Body $body `
            -ContentType "application/json"

        Write-Host "Repository created successfully!" -ForegroundColor Green
        Write-Host "Repository URL: $($response.html_url)" -ForegroundColor Cyan
    } catch {
        Write-Host "Failed to create repository via API: $_" -ForegroundColor Red
        Write-Host "You'll need to create it manually at: https://github.com/new" -ForegroundColor Yellow
        Write-Host "Repository name: $repoName" -ForegroundColor Yellow
        Write-Host "Then run the commands below to push your code." -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "No GitHub token provided. Please create the repository manually:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor Cyan
    Write-Host "2. Repository name: $repoName" -ForegroundColor Cyan
    Write-Host "3. Description: $repoDescription" -ForegroundColor Cyan
    Write-Host "4. Choose Public or Private" -ForegroundColor Cyan
    Write-Host "5. DO NOT initialize with README, .gitignore, or license" -ForegroundColor Cyan
    Write-Host "6. Click 'Create repository'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Enter after creating the repository to continue..." -ForegroundColor Yellow
    Read-Host
}

# Add remote and push
Write-Host "Adding remote origin..." -ForegroundColor Cyan
git remote add origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Remote might already exist, trying to set URL..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Success! Your repository is now available at:" -ForegroundColor Green
    Write-Host $repoUrl -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Push failed. Please check:" -ForegroundColor Red
    Write-Host "1. Repository exists at: $repoUrl" -ForegroundColor Yellow
    Write-Host "2. You have push access" -ForegroundColor Yellow
    Write-Host "3. Your Git credentials are configured" -ForegroundColor Yellow
}

