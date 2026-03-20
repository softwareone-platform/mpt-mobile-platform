# Export Zscaler root CA certificate as PEM for Node.js
$cert = Get-ChildItem -Path Cert:\LocalMachine\Root | Where-Object { $_.Subject -like '*Zscaler*' } | Select-Object -First 1

if (-not $cert) {
    Write-Host "No Zscaler certificate found in Trusted Root store" -ForegroundColor Red
    exit 1
}

Write-Host "Found: $($cert.Subject)" -ForegroundColor Green
Write-Host "Thumbprint: $($cert.Thumbprint)"

$pemPath = "$env:USERPROFILE\.zscaler-root-ca.pem"
$base64 = [Convert]::ToBase64String($cert.RawData, 'InsertLineBreaks')
$pem = "-----BEGIN CERTIFICATE-----`n$base64`n-----END CERTIFICATE-----"
Set-Content -Path $pemPath -Value $pem -Encoding ASCII

Write-Host "Exported to: $pemPath" -ForegroundColor Green
Write-Host ""
Write-Host "Add this to your .env file or set before running tests:" -ForegroundColor Yellow
Write-Host "  NODE_EXTRA_CA_CERTS=$pemPath"
