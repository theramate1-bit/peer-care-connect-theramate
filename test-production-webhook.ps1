# PowerShell script to test webhook with production secret
Write-Host "🔧 Testing Webhook with Production Secret..." -ForegroundColor Blue

# Generate fresh signature using production webhook secret
$timestamp = [Math]::Floor([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
$payload = '{"id":"evt_test_prod_123","object":"event","type":"checkout.session.completed","data":{"object":{"id":"cs_test_prod_123","payment_status":"paid","amount_total":0,"subscription":"sub_test_prod_123","customer":"cus_test_prod_123","metadata":{"user_id":"1f5987ad-5530-4441-aea9-ce50ca9bc60b","plan":"pro","billing":"monthly"}}}}'

# Use production webhook secret
$webhookSecret = "whsec_9g8S4MwyWBwFyLzKyWqGbdWZIKPPq5sZ"
$signedPayload = "$timestamp.$payload"
$hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($webhookSecret))
$signature = [System.BitConverter]::ToString($hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($signedPayload))).Replace("-", "").ToLower()

$headers = @{
    'Content-Type' = 'application/json'
    'Stripe-Signature' = "t=$timestamp,v1=$signature"
}

Write-Host "Testing webhook with production signature: t=$timestamp,v1=$signature" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook" -Method POST -Headers $headers -Body $payload
    Write-Host "✅ SUCCESS: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}
