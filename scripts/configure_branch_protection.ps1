# ==============================================================================
# SIVORA DevOps - Configure GitHub Branch Protection Rules via GitHub CLI (gh)
# Day 23 DevOps / AWS Focus Automation
# ==============================================================================

param(
    [string]$Repo = "Venkata-Narasimha-11/coastal-seven",
    [string]$Branch = "main"
)

Write-Host "Configuring Enterprise Branch Protection for repository: $Repo on branch: $Branch..." -ForegroundColor Cyan

# 1. Verify GitHub CLI is installed and authenticated
$ghCheck = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghCheck) {
    Write-Warning "GitHub CLI (gh) is not installed on this machine."
    Write-Host "You can manually apply these rules in GitHub Repo Settings -> Branches -> Add Classic Branch Protection Rule." -ForegroundColor Yellow
    Write-Host "Required Status Checks:"
    Write-Host " - Backend Pytest & Code Quality"
    Write-Host " - Frontend TypeScript, Vitest & Vite Build"
    Write-Host " - Dockerfile & Compose Syntax Validation"
    Write-Host " - Docker Multi-Stage Build & Image Push"
    exit 0
}

# 2. Check Authentication
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warning "GitHub CLI is not logged in. Run 'gh auth login' to authenticate."
    exit 1
}

# 3. Apply Branch Protection Payload via GitHub REST API
$rulesFile = Join-Path $PSScriptRoot "..\..\.github\branch-protection-rules.json"
if (-not (Test-Path $rulesFile)) {
    Write-Error "Branch protection definition file not found at: $rulesFile"
    exit 1
}

Write-Host "Sending PUT request to /repos/$Repo/branches/$Branch/protection..." -ForegroundColor Gray
$jsonContent = Get-Content $rulesFile -Raw

gh api --method PUT "/repos/$Repo/branches/$Branch/protection" --input $rulesFile | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully applied branch protection rules to '$Branch'!" -ForegroundColor Green
    Write-Host "Protected status checks:" -ForegroundColor Green
    Write-Host " - Backend Pytest & Code Quality"
    Write-Host " - Frontend TypeScript, Vitest & Vite Build"
    Write-Host " - Dockerfile & Compose Syntax Validation"
    Write-Host " - Docker Multi-Stage Build & Image Push"
    Write-Host " - Enforce admins: Enabled"
    Write-Host " - Require PR review (1 approval): Enabled"
    Write-Host " - Prevent force pushes: Enabled"
} else {
    Write-Error "Failed to apply branch protection rules. Verify repository admin privileges."
}
