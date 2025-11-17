<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Inquiry</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 20px;
        }
        .field {
            margin-bottom: 15px;
        }
        .field-label {
            font-weight: bold;
            color: #0066cc;
        }
        .field-value {
            margin-top: 5px;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 3px solid #0066cc;
            word-wrap: break-word;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Inquiry</h2>
            <p>You have received a new message from the contact form.</p>
        </div>

        <div class="content">
            <div class="field">
                <div class="field-label">From:</div>
                <div class="field-value">{{ $contact->first_name }} {{ $contact->last_name }}</div>
            </div>

            <div class="field">
                <div class="field-label">Email:</div>
                <div class="field-value">{{ $contact->email }}</div>
            </div>

            <div class="field">
                <div class="field-label">Message:</div>
                <div class="field-value">{!! nl2br(e($contact->message)) !!}</div>
            </div>

            <div class="field">
                <div class="field-label">Received:</div>
                <div class="field-value">{{ $contact->created_at->format('Y-m-d H:i:s') }}</div>
            </div>
        </div>

        <div class="footer">
            <p>Reply to: <strong>{{ $contact->email }}</strong></p>
            <p>This is an automated message from your EZApply contact form.</p>
        </div>
    </div>
</body>
</html>
