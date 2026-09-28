[CmdletBinding()]
param(
    [ValidateRange(1, 5000)]
    [int]$MaxConnections = 500
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

try {
    $connections = @(
        Get-NetTCPConnection -State Established -ErrorAction Stop |
            Sort-Object -Property OwningProcess, RemoteAddress, RemotePort |
            Select-Object -First $MaxConnections
    )
}
catch {
    Write-Error "Could not read established TCP connections. No system settings were changed. Details: $($_.Exception.Message)"
    exit 1
}

if ($connections.Count -eq 0) {
    [Console]::Out.WriteLine('[]')
    exit 0
}

$processNames = @{}
$normalized = foreach ($connection in $connections) {
    $processId = [int]$connection.OwningProcess
    if (-not $processNames.ContainsKey($processId)) {
        try {
            $processNames[$processId] = (Get-Process -Id $processId -ErrorAction Stop).ProcessName
        }
        catch {
            $processNames[$processId] = $null
        }
    }

    [pscustomobject][ordered]@{
        schemaVersion = '1.0'
        protocol      = 'TCP'
        state         = [string]$connection.State
        localAddress  = [string]$connection.LocalAddress
        localPort     = [int]$connection.LocalPort
        remoteAddress = [string]$connection.RemoteAddress
        remotePort    = [int]$connection.RemotePort
        processId     = $processId
        processName   = $processNames[$processId]
    }
}

$json = ConvertTo-Json -InputObject @($normalized) -Depth 4
[Console]::Out.WriteLine($json)
