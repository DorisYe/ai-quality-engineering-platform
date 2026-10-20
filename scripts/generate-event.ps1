param(
  [string]$Type = "StorageCapacityWarning",
  [ValidateSet("Info", "Warning", "Critical")]
  [string]$Severity = "Warning",
  [string]$Source = "TestStorage01",
  [string]$BaseUrl = "http://127.0.0.1:3100"
)

$payload = @{
  type = $Type
  severity = $Severity
  source = $Source
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BaseUrl/api/events" -Method Post -ContentType "application/json" -Body $payload
