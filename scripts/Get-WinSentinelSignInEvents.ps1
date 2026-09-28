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

function Get-EventFields {
    param(
        [Parameter(Mandatory)]
        [System.Diagnostics.Eventing.Reader.EventRecord]$Record
    )

    [xml]$eventXml = $Record.ToXml()
    $fields = @{}

    foreach ($node in $eventXml.SelectNodes("//*[local-name()='EventData']/*[local-name()='Data']")) {
        $name = $node.GetAttribute('Name')
        if (-not [string]::IsNullOrWhiteSpace($name)) {
            $fields[$name] = $node.InnerText
        }
    }

    return $fields
}

function Get-OptionalText {
    param(
        [Parameter(Mandatory)]
        [hashtable]$Fields,

        [Parameter(Mandatory)]
        [string]$Name
    )

    if (-not $Fields.ContainsKey($Name)) {
        return $null
    }

    $value = [string]$Fields[$Name]
    if ([string]::IsNullOrWhiteSpace($value) -or $value -eq '-') {
        return $null
    }

    return $value
}

$startTime = (Get-Date).AddHours(-$SinceHours)
try {
    if ($RemoteOnly) {
        $startTimeUtc = $startTime.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ', [Globalization.CultureInfo]::InvariantCulture)
        $filterXPath = "*[System[(EventID=4624 or EventID=4625) and TimeCreated[@SystemTime >= '$startTimeUtc']] and EventData[Data[@Name='LogonType']='3' or Data[@Name='LogonType']='10' or Data[@Name='LogonType']='12']]"
        $records = @(Get-WinEvent -LogName 'Security' -FilterXPath $filterXPath -MaxEvents $MaxEvents -ErrorAction Stop)
    }
    else {
        $filter = @{
            LogName   = 'Security'
            Id        = @(4624, 4625)
            StartTime = $startTime
        }
        $records = @(Get-WinEvent -FilterHashtable $filter -MaxEvents $MaxEvents -ErrorAction Stop)
    }
}
catch {
    if ($_.FullyQualifiedErrorId -match 'NoMatchingEventsFound') {
        [Console]::Out.WriteLine('[]')
        exit 0
    }

    Write-Error "Could not read the Windows Security log. No system settings were changed. Details: $($_.Exception.Message)"
    exit 1
}

if ($records.Count -eq 0) {
    [Console]::Out.WriteLine('[]')
    exit 0
}

$normalized = foreach ($record in $records) {
    $fields = Get-EventFields -Record $record
    $logonType = Get-OptionalText -Fields $fields -Name 'LogonType'
    if ($RemoteOnly -and $logonType -notin @('3', '10', '12')) {
        continue
    }

    $rawPort = Get-OptionalText -Fields $fields -Name 'IpPort'
    $sourcePort = $null
    $parsedPort = 0

    if ($null -ne $rawPort -and [int]::TryParse($rawPort, [ref]$parsedPort)) {
        $sourcePort = $parsedPort
    }

    [pscustomobject][ordered]@{
        schemaVersion   = '1.0'
        eventId         = [int]$record.Id
        recordId        = $record.RecordId
        timeUtc         = $record.TimeCreated.ToUniversalTime().ToString('o')
        computer        = $record.MachineName
        result          = if ($record.Id -eq 4624) { 'success' } else { 'failure' }
        logonType       = $logonType
        accountName     = Get-OptionalText -Fields $fields -Name 'TargetUserName'
        accountDomain   = Get-OptionalText -Fields $fields -Name 'TargetDomainName'
        sourceAddress   = Get-OptionalText -Fields $fields -Name 'IpAddress'
        sourcePort      = $sourcePort
        workstation     = Get-OptionalText -Fields $fields -Name 'WorkstationName'
        failureStatus   = Get-OptionalText -Fields $fields -Name 'Status'
        failureSubStatus  = Get-OptionalText -Fields $fields -Name 'SubStatus'
        failureReason   = Get-OptionalText -Fields $fields -Name 'FailureReason'
    }
}

if ($null -eq $normalized) {
    [Console]::Out.WriteLine('[]')
    exit 0
}

$json = ConvertTo-Json -InputObject @($normalized) -Depth 4
[Console]::Out.WriteLine($json)