# Installs the `tokenmaxxing` CLI on a Windows computer, then runs it with this script's arguments:
#   & ([scriptblock]::Create((irm __SERVER__/install.ps1))) link '<code>'
# The app's "Link a Windows computer..." gives you this line with a code in it. It runs in the window it's
# pasted into, so it never calls `exit` (that would close the window): errors throw, the end returns.
$ErrorActionPreference = 'Stop'
# Windows PowerShell's progress bar makes Invoke-WebRequest many times slower.
$ProgressPreference = 'SilentlyContinue'
# Windows PowerShell 5.1 may not offer TLS 1.2 by itself, and GitHub needs it.
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$server = '__SERVER__'
$base = if ($env:TOKENMAXXING_DOWNLOAD_BASE) { $env:TOKENMAXXING_DOWNLOAD_BASE } else { 'https://github.com/HansKristoffer/tokenmaxxing/releases/latest/download' }
$dir = if ($env:TOKENMAXXING_INSTALL_DIR) { $env:TOKENMAXXING_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA 'Programs\tokenmaxxing' }

# The machine's own CPU: an x64 PowerShell on an Arm PC still gets the Arm build.
$cpu = if ($env:PROCESSOR_ARCHITEW6432) { $env:PROCESSOR_ARCHITEW6432 } else { $env:PROCESSOR_ARCHITECTURE }
$arch = switch ($cpu) {
  'AMD64' { 'x64' }
  'ARM64' { 'arm64' }
  default { throw "tokenmaxxing doesn't run on $cpu yet." }
}

$file = "tokenmaxxing-windows-$arch.exe"
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("tokenmaxxing-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  Write-Host "Downloading $file..."
  Invoke-WebRequest -UseBasicParsing -Uri "$base/$file" -OutFile (Join-Path $tmp $file)
  Invoke-WebRequest -UseBasicParsing -Uri "$base/SHA256SUMS" -OutFile (Join-Path $tmp 'SHA256SUMS')
  $want = $null
  foreach ($line in Get-Content (Join-Path $tmp 'SHA256SUMS')) {
    $hash, $name = $line -split ' +\*?', 2
    if ($name -eq $file) { $want = $hash.ToLowerInvariant() }
  }
  $got = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $tmp $file)).Hash.ToLowerInvariant()
  if (-not $want -or $want -ne $got) { throw "The download didn't match its checksum; nothing was installed." }

  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $exe = Join-Path $dir 'tokenmaxxing.exe'
  # A running exe can't be replaced, but it can be renamed: the background service keeps the old one
  # until it next starts.
  $old = Join-Path $dir 'tokenmaxxing.old.exe'
  Remove-Item -LiteralPath $old -Force -ErrorAction SilentlyContinue
  if (Test-Path -LiteralPath $exe) { Rename-Item -LiteralPath $exe -NewName 'tokenmaxxing.old.exe' }
  Move-Item -LiteralPath (Join-Path $tmp $file) -Destination $exe
} finally {
  Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "Installed $exe"

# On this user's PATH, for new windows, and for this one now.
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (-not (($userPath -split ';') -contains $dir)) {
  [Environment]::SetEnvironmentVariable('Path', (@($userPath, $dir) | Where-Object { $_ }) -join ';', 'User')
  Write-Host "Added $dir to your PATH."
}
if (-not (($env:Path -split ';') -contains $dir)) { $env:Path = "$env:Path;$dir" }

if ($args.Count -gt 0) {
  $env:TOKENMAXXING_SERVER_URL = $server
  # It says itself what went wrong, if anything did.
  & $exe @args
}
