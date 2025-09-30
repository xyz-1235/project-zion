# Project Zion AI Int#Set up your Cohere API key as an environment variable in Netlify:

**In Netlify Dashboard:**
1. Go to Site Settings > Build & deploy > Environment variables
2. Add new variable:
   - Key: `COHERE_API_KEY`
   - Value: Your Cohere API key

**For local development (.env file):**
```
COHERE_API_KEY=your_cohere_api_key_here
```

### 2. Get Cohere API Key
1. Visit [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)
2. Create a free account
3. Create a new API keyIntegration

This directory contains the complete AI integration files for Project Zion.

## Files Created

### Backend: `netlify/functions/getAIResponse.js`
- Secure Node.js serverless function for Netlify
- Handles communication with Cohere API
- Uses environment variables for API key security
- Includes comprehensive error handling and CORS support

### Frontend: `aitest.js`
- Complete JavaScript class-based implementation
- Self-contained chat interface with styling
- Secure communication with backend function
- Loading states and error handling
- Auto-resizing input and responsive design

## Setup Instructions

### 1. Environment Configuration
Set up your Cohere API key as an environment variable in Netlify:

**In Netlify Dashboard:**
1. Go to Site Settings > Build & deploy > Environment variables
2. Add new variable:
   - Name: `COHERE_API_KEY`
   - Value: your_cohere_api_key_here

**For local development (.env file):**
```
COHERE_API_KEY=your_cohere_api_key_here
```

### 2. Get Cohere API Key
1. Visit [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)
2. Sign up for a free account
3. Create a new API key
4. Copy the key for use in environment variablesirectory contains the complete AI integration files for Project Zion.

## Files Created

### Backend: `netlify/functions/getAIResponse.js`
- Secure Node.js serverless function for Netlify
- Handles communication with Cohere API
- Uses environment variables for API key security
- Includes comprehensive error handling and CORS support

### Frontend: `aitest.js`
- Complete JavaScript class-based implementation
- Self-contained chat interface with styling
- Secure communication with backend function
- Loading states and error handling
- Auto-resizing input and responsive design

## Setup Instructions

### 1. Environment Configuration
Set up your Google AI API key as an environment variable in Netlify:

**In Netlify Dashboard:**
1. Go to Site Settings > Build & deploy > Environment variables
2. Add new variable:
   - Key: `GOOGLE_AI_API_KEY`
   - Value: Your Google AI Studio API key

**For local development (.env file):**
```
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 2. Get Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for use in environment variables

### 3. Integration Options

**Option A: Auto-initialization (Recommended)**
Simply include the script in your HTML:
```html
<script src="aitest.js"></script>
```
The chat interface will automatically initialize when the page loads.

**Option B: Manual initialization**
```html
<script src="aitest.js"></script>
<script>
  // Initialize manually
  const ai = new ProjectZionAI();
</script>
```

**Option C: Add to existing page**
```html
<div id="main-content">
  <!-- Your existing content -->
</div>
<script src="aitest.js"></script>
```

### 4. Customization

The chat interface is fully self-contained with CSS styles. You can customize:

- Colors and styling by modifying the CSS in `addStyles()` method
- Maximum message length by changing `maxMessageLength` property
- Request timeout by modifying `requestTimeout` property
- API endpoint if needed by updating `apiEndpoint` property

## Security Features

✅ **API Key Protection**: API key stored securely in server environment  
✅ **CORS Handling**: Proper CORS headers for cross-origin requests  
✅ **Input Validation**: Message validation and sanitization  
✅ **Error Handling**: Comprehensive error handling with user-friendly messages  
✅ **XSS Prevention**: HTML escaping for user inputs  
✅ **Request Timeout**: Automatic timeout protection  

## Deployment

1. **Deploy to Netlify**: 
   - Push your code to Git repository
   - Connect repository to Netlify
   - Add environment variable for API key
   - Deploy

2. **Test the integration**:
   - Visit your deployed site
   - Try sending a message to the AI
   - Verify responses are working

## Troubleshooting

**Common Issues:**

1. **"Server configuration error"**: Missing API key environment variable
2. **"AI service temporarily unavailable"**: Invalid API key or Google API issues
3. **"Network error"**: CORS issues or connectivity problems
4. **"Request timed out"**: Slow network or API response

**Debug Steps:**
1. Check Netlify function logs for server-side errors
2. Check browser console for client-side errors
3. Verify API key is correctly set in environment variables
4. Test API key with Cohere dashboard or local testing

## API Endpoint
The frontend calls: `/.netlify/functions/getAIResponse`

This endpoint expects:
```json
{
  "message": "Your message here"
}
```

And returns:
```json
{
  "reply": "AI response here"
}
```

## Dependencies
- No external dependencies required
- Uses native fetch API
- Compatible with modern browsers
- Works with Netlify Functions runtime