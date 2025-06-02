# Jordan Laboratory Website with RAG Assistant

A modern laboratory website featuring an AI-powered chat assistant that can answer questions about research, publications, team members, and laboratory resources using Retrieval Augmented Generation (RAG) powered by Notion and OpenAI.

## Features

- 🤖 **AI Chat Assistant**: Powered by OpenAI GPT-4 with RAG capabilities
- 📚 **Notion Integration**: Searches your Notion workspace for relevant information
- 🔒 **Secure Backend**: API keys safely stored server-side
- 💬 **Real-time Chat**: Interactive chat interface with typing indicators
- 📖 **Source Citations**: Shows which documents were used to generate responses
- 🚀 **Fast Responses**: Optimized search and response generation

## Architecture

- **Frontend**: Static HTML/CSS/JavaScript
- **Backend**: Node.js/Express server with RAG capabilities
- **AI**: OpenAI GPT-4 for response generation
- **Knowledge Base**: Notion workspace integration
- **Deployment**: Can be deployed to any Node.js hosting platform

## Prerequisites

- Node.js 16+ and npm
- Notion account with integration setup
- OpenAI API account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repository>
cd jordan-group-site
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Environment variables for Jordan Lab RAG system
NOTION_TOKEN=your_notion_integration_token_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

**Important:** Never commit API keys to your repository!
- Get your Notion integration token from [Notion Integrations](https://www.notion.so/my-integrations)
- Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Keep these keys secure and use environment variables

### 3. Set Up Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration or use your existing one
3. Copy the Internal Integration Token (already provided above)
4. Share your Notion pages/databases with the integration:
   - Go to your Notion workspace
   - Click "Share" on pages you want the assistant to access
   - Invite your integration by name

### 4. Organize Your Notion Content

For best results, organize your lab's information in Notion:

- **Research Projects**: Create pages for each research area
- **Publications**: Database or pages with publication information
- **Team Members**: Pages with team member details and expertise
- **Methods & Protocols**: Documentation of laboratory methods
- **Resources**: Equipment, software, and facility information

### 5. Run the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The website will be available at `http://localhost:3000`

## Usage

1. **Visit the Website**: Open `http://localhost:3000` in your browser
2. **Chat Interface**: Use the chat interface to ask questions about the lab
3. **Sample Questions**:
   - "What research projects are you working on?"
   - "Tell me about your recent publications"
   - "Who are the team members?"
   - "What methods do you use?"
   - "What equipment is available?"

## API Endpoints

- `GET /`: Serves the main website
- `POST /api/chat`: Processes chat queries
- `GET /api/health`: Health check endpoint

### Chat API Usage

```javascript
// POST /api/chat
{
  "query": "What research does the lab focus on?"
}

// Response
{
  "answer": "Generated response based on Notion content...",
  "sources": [
    {
      "title": "Research Overview",
      "url": "https://notion.so/...",
      "snippet": "Preview of the content..."
    }
  ],
  "success": true
}
```

## Deployment Options

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Add environment variables in Vercel dashboard

### Heroku
1. Create new Heroku app
2. Set environment variables: `heroku config:set NOTION_TOKEN=...`
3. Deploy: `git push heroku main`

### Railway
1. Connect GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on git push

## Customization

### Modify the AI Assistant

Edit the system prompt in `server.js`:

```javascript
const systemPrompt = `You are an AI assistant for the James M. Jordan Laboratory...`;
```

### Add New Data Sources

Extend the `searchNotionContent` method in `server.js` to include additional databases or filter specific content types.

### Customize the UI

- Modify `index.html` for layout changes
- Edit `css/` files for styling
- Update `js/rag.js` for frontend behavior

## Troubleshooting

### Common Issues

1. **"RAG API is not available"**
   - Check if the server is running on port 3000
   - Verify environment variables are set correctly

2. **"Failed to search Notion content"**
   - Ensure the Notion integration has access to your pages
   - Check the Notion token is valid and not expired

3. **"Failed to generate response"**
   - Verify OpenAI API key is valid and has sufficient credits
   - Check OpenAI API status

### Debug Mode

Add debug logging by setting `NODE_ENV=development` in your `.env` file.

## Security Considerations

- Never commit `.env` file to version control
- Use environment variables for all sensitive data
- Implement rate limiting for production use
- Consider adding authentication for admin features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Check the troubleshooting section above
- Review the server logs for error messages
- Contact the development team

---

**Note**: Remember to keep your API keys secure and never share them publicly! 