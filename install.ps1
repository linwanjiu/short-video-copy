# short-video-copy 一行安装（输出保持 ASCII：这个文件会被 irm ... | iex 执行）
#
#   irm https://raw.githubusercontent.com/linwanjiu/short-video-copy/main/install.ps1 | iex
#   irm https://ghproxy.net/https://raw.githubusercontent.com/linwanjiu/short-video-copy/main/install.ps1 | iex

param(
    [string]$Dir = (Join-Path $env:USERPROFILE ".dsh\skills"),
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$repo = "https://github.com/linwanjiu/short-video-copy.git"
$tmp = Join-Path $env:TEMP ("short-video-copy-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
$dest = Join-Path $Dir "short-video-copy"

Write-Host ""
Write-Host "short-video-copy installer"
Write-Host "  target: $dest"
Write-Host ""

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) { throw "git not found. Install Git for Windows first: https://git-scm.com/download/win" }

try {
    Write-Host "  cloning ..."
    & git clone --depth 1 --quiet $repo $tmp
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  retry with openssl backend ..."
        & git -c http.sslBackend=openssl clone --depth 1 --quiet $repo $tmp
    }
    if ($LASTEXITCODE -ne 0) { throw "git clone failed" }

    $src = Join-Path $tmp "skills\short-video-copy"
    if (-not (Test-Path (Join-Path $src "SKILL.md"))) { throw "skill payload not found in clone" }

    New-Item -ItemType Directory -Force -Path $dest | Out-Null

    # 保留用户自己的 profile.md
    $keepProfile = $false
    $profile = Join-Path $dest "profile.md"
    if ((Test-Path $profile) -and (-not $Force)) {
        $backup = Join-Path $env:TEMP ("profile-backup-" + [guid]::NewGuid().ToString("N").Substring(0, 8) + ".md")
        Copy-Item $profile $backup -Force
        $keepProfile = $true
    }

    Copy-Item (Join-Path $src "*") $dest -Recurse -Force

    if ($keepProfile) {
        Copy-Item $backup $profile -Force
        Remove-Item $backup -Force
        Write-Host "  kept your existing profile.md (use -Force to overwrite)"
    }

    Write-Host "  installed -> $dest"
} finally {
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}

Write-Host ""
Write-Host "Done. In a new DSH session, say: write me a short-video script about ..."
Write-Host ""
