[CmdletBinding()]
param(
    [ValidateRange(1, 720)]
    [int]$SinceHours = 24,

    [ValidateRange(1, 5000)]
    [int]$MaxEvents = 200,

    [switch]$RemoteOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

if ($PSVersionTable.PSVersion.Major -lt 7) {
    throw 'This snapshot script requires PowerShell 7 or later so it can invoke the existing collectors in isolated child processes.'
}

$powerShellPath = Join-Path $PSHOME 'pwsh.exe'
$signInCollector = Join-Path $PSScriptRoot 'Get-WinSentinelSignInEvents.ps1'
$sessionCollector = Join-Path $PSScriptRoot 'Get-WinSentinelRemoteSessions.ps1'

function Invoke-CollectorJson {
    param(
        [Parameter(Mandatory)]
        [string]$ScriptPath,

        [Parameter(Mandatory)]
        [AllowEmptyCollection()]
        [string[]]$Arguments
    )

    $outputLines = & $powerShellPath -NoLogo -NoProfile -NonInteractive -File $ScriptPath @Arguments
    $collectorExitCode = $LASTEXITCODE
    if ($collectorExitCode -ne 0) {
        throw "Collector '$([System.IO.Path]::GetFileName($ScriptPath))' failed with exit code $collectorExitCode. See the collector error above."
    }

    $json = [string]::Join([Environment]::NewLine, [string[]]@($outputLines))
    if ([string]::IsNullOrWhiteSpace($json)) {
        throw "Collector '$([System.IO.Path]::GetFileName($ScriptPath))' returned no JSON output."
    }

    return $json
}

function Convert-CollectorJsonToArray {
    param(
        [Parameter(Mandatory)]
        [string]$Json,

        [Parameter(Mandatory)]
        [string]$CollectorName
    )

    try {
        $records = ConvertFrom-Json -InputObject $Json -NoEnumerate -ErrorAction Stop
    }
    catch {
        throw "Collector '$CollectorName' returned invalid JSON: $($_.Exception.Message)"
    }

    if ($records -isnot [System.Array]) {
        throw "Collector '$CollectorName' returned JSON that was not an array."
    }

    return ,$records
}

$signInArguments = @(
    '-SinceHours', $SinceHours.ToString([Globalization.CultureInfo]::InvariantCulture),
    '-MaxEvents', $MaxEvents.ToString([Globalization.CultureInfo]::InvariantCulture)
)
if ($RemoteOnly) {
    $signInArguments += '-RemoteOnly'
}

$signInJson = Invoke-CollectorJson -ScriptPath $signInCollector -Arguments $signInArguments
$signInEvents = Convert-CollectorJsonToArray -Json $signInJson -CollectorName 'Get-WinSentinelSignInEvents.ps1'

$sessionJson = Invoke-CollectorJson -ScriptPath $sessionCollector -Arguments @()
$remoteSessions = Convert-CollectorJsonToArray -Json $sessionJson -CollectorName 'Get-WinSentinelRemoteSessions.ps1'

$snapshot = [pscustomobject][ordered]@{
    schemaVersion = '1.0'
    collectedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    sinceHours = $SinceHours
    signInEvents = @($signInEvents)
    remoteSessions = @($remoteSessions)
}

$snapshotJson = ConvertTo-Json -InputObject $snapshot -Depth 8
Write-Output $snapshotJson
