#!/bin/bash

# Jordan Lab RAG Server Startup Script
echo "🚀 Starting Jordan Lab RAG Server..."

# Set environment variables
export NOTION_TOKEN=your_notion_token_here
export OPENAI_API_KEY=your_openai_api_key_here
export PORT=3001

# Start the server
echo "📊 Starting server on port 3001..."
echo "🌐 Website will be available at: http://localhost:3001"
echo "💬 Chat interface will connect to your Notion workspace"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server.js 