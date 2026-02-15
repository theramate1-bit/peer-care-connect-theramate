# Test Resend Email Function
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa3Fudmx0dXd3Z2lmdW9jdnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1Nzk5MDAsImV4cCI6MjA0NDE1NTkwMH0.cd0RLjwYqV-ED_c0h0h5YBEv7DJuYjBEkO5zOBYkLZQ"
    "Content-Type" = "application/json"
}

$body = @{
    emailType = "booking_confirmation_client"
    recipientEmail = "delivered@resend.dev"
    recipientName = "Test User"
    data = @{
        sessionType = "Massage Therapy"
        sessionDate = "2025-02-15"
        sessionTime = "14:00"
        sessionPrice = 50
        sessionDuration = 60
        practitionerName = "John Doe"
        bookingUrl = "https://theramate.co.uk/my-bookings"
        messageUrl = "https://theramate.co.uk/messages"
    }
} | ConvertTo-Json -Depth 10

Write-Host "Testing Resend Email Function..."
Write-Host "Sending test email to: delivered@resend.dev"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/send-email" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Details:" -ForegroundColor Red
    
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody
}

