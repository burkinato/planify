Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot
Set-Location $workspaceRoot

& cmd /c npm.cmd run dev