# NovaTok Music - Marketing Automation

Automatically trigger marketing workflows when new tracks are uploaded.

## Overview

When a track is successfully uploaded to NovaTok Music, the system sends a webhook to your n8n instance (or any webhook-compatible automation platform). This enables:

- **Social Media Posts**: Auto-post new tracks to Twitter, Instagram, Discord
- **Email Notifications**: Send "New Music Alert" emails to subscribers
- **Slack/Discord Alerts**: Notify your team about new uploads
- **Analytics**: Log uploads to Google Sheets, Airtable, etc.
- **Content Pipeline**: Trigger album art generation, transcription, etc.

---

## Setup

### 1. Environment Variable

Add to your `.env.local` or hosting provider:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/abc123
```

### 2. Webhook Payload

On every successful upload, a POST request is sent with:

```json
{
  "trackId": "uuid-of-track",
  "title": "Track Title",
  "artist": "Artist Name",
  "publicUrl": "https://supabase.storage/music-audio/...",
  "coverUrl": "https://supabase.storage/music-covers/...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. Behavior

- **Fire and Forget**: Webhook failures don't block the upload
- **Graceful Degradation**: If `N8N_WEBHOOK_URL` is not set, webhook is silently skipped
- **Logging**: Failed webhooks log a warning to the server console

---

## n8n Workflow Setup

### Step 1: Create Webhook Trigger

1. Open n8n and create a new workflow
2. Add a **Webhook** node as the trigger
3. Set HTTP Method to `POST`
4. Copy the **Production URL** - this is your `N8N_WEBHOOK_URL`
5. Click "Listen for Test Event" to test

### Step 2: Example Workflows

#### A) Post to Twitter/X

```
[Webhook] → [Twitter] Post Tweet
```

Twitter node configuration:
- Text: `🎵 New track alert!\n\n"{{$json.title}}" by {{$json.artist}}\n\nListen now: {{$json.publicUrl}}`

#### B) Send Email to Subscribers

```
[Webhook] → [SendGrid/Mailchimp] Send Email
```

Email template variables:
- `{{trackTitle}}` = `{{$json.title}}`
- `{{artistName}}` = `{{$json.artist}}`
- `{{coverImage}}` = `{{$json.coverUrl}}`
- `{{listenLink}}` = Build from your site URL + trackId

#### C) Discord Notification

```
[Webhook] → [Discord] Send Message
```

Discord message:
```
🎶 **New Upload on NovaTok**
**Track:** {{$json.title}}
**Artist:** {{$json.artist}}
**Cover:** {{$json.coverUrl}}
```

#### D) Log to Google Sheets

```
[Webhook] → [Google Sheets] Append Row
```

Map columns:
- A: `{{$json.trackId}}`
- B: `{{$json.title}}`
- C: `{{$json.artist}}`
- D: `{{$json.createdAt}}`
- E: `{{$json.publicUrl}}`

---

## Alternative Platforms

This webhook works with any platform that accepts HTTP POST:

| Platform | How to Use |
|----------|------------|
| **Zapier** | Use "Webhooks by Zapier" trigger |
| **Make (Integromat)** | Use "Webhooks" module |
| **Pipedream** | Create HTTP trigger workflow |
| **IFTTT** | Use Webhooks service |
| **Custom Server** | POST endpoint that accepts JSON |

---

## Testing

### Test with curl

```bash
curl -X POST https://your-n8n-url/webhook/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "trackId": "test-123",
    "title": "Test Track",
    "artist": "Test Artist",
    "publicUrl": "https://example.com/audio.mp3",
    "coverUrl": "https://example.com/cover.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }'
```

### Test in n8n

1. Set your webhook URL in `.env.local`
2. In n8n, click "Listen for Test Event" on your Webhook node
3. Upload a track in NovaTok Music
4. Check n8n received the payload
5. Activate the workflow for production

---

## Security Considerations

1. **Keep webhook URL secret**: Treat `N8N_WEBHOOK_URL` like a password
2. **Add authentication** (optional): n8n supports header authentication
3. **Rate limiting**: Consider adding rate limiting in n8n for abuse prevention
4. **Validate payloads**: In n8n, validate that required fields exist

### Adding Webhook Authentication

To add a secret header for validation:

1. In your n8n webhook, enable "Authentication"
2. Set a header key/value (e.g., `X-Webhook-Secret: your-secret`)
3. Modify the webhook call in `data-service.js`:

```javascript
const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': process.env.WEBHOOK_SECRET,
  },
  body: JSON.stringify(payload),
});
```

---

## Troubleshooting

### Webhook not firing
- Check `N8N_WEBHOOK_URL` is set correctly
- Check server logs for webhook errors
- Verify n8n workflow is activated

### n8n not receiving data
- Ensure workflow is in "Active" mode (not just test mode)
- Check n8n execution logs
- Verify URL is the Production URL, not Test URL

### Data missing fields
- `coverUrl` may be `null` if no cover was uploaded
- All other fields should always be present

---

## Example: Complete Social Media Pipeline

```
[Webhook Trigger]
       ↓
[IF] coverUrl exists?
    ├─ Yes → [HTTP Request] Download cover image
    │            ↓
    │        [Twitter] Post with media
    │            ↓
    │        [Instagram] Post to story
    │
    └─ No → [Twitter] Post text only

       ↓
[Slack] Notify #music-uploads channel
       ↓
[Google Sheets] Log upload
       ↓
[SendGrid] Email to premium subscribers
```

This creates a fully automated marketing pipeline for every track upload!
