[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

try {
    if (-not ('WinSentinel.NativeWts' -as [type])) {
        Add-Type -Path (Join-Path $PSScriptRoot 'WinSentinel.NativeWts.cs') -ErrorAction Stop
    }

    $sessions = @([WinSentinel.NativeWts]::EnumerateRemoteSessions())
    if ($sessions.Count -eq 0) {
        [Console]::Out.WriteLine('[]')
        exit 0
    }

    $normalized = foreach ($session in $sessions) {
        [pscustomobject][ordered]@{
            schemaVersion          = '1.0'
            sessionId              = $session.SessionId
            sessionName            = $session.SessionName
            state                  = $session.State
            userName               = $session.UserName
            domainName             = $session.DomainName
            clientReportedAddress = $session.ClientReportedAddress
        }
    }

    [Console]::Out.WriteLine((ConvertTo-Json -InputObject @($normalized) -Depth 4))
}
catch {
    Write-Error "Could not read local Remote Desktop sessions. No settings were changed. Details: $($_.Exception.Message)"
    exit 1
}