// Jordan Laboratory RAG Server
// Handles secure integration with Notion and OpenAI for the chat assistant

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Client } = require('@notionhq/client');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize APIs
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'file://'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// RAG Service Class
class RAGService {
    constructor() {
        this.vectorStore = new Map(); // Simple in-memory store (use proper vector DB in production)
        this.contentCache = new Map(); // Cache for Notion content
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
    }

    async searchNotionContent(query) {
        try {
            console.log('Searching Notion for:', query);
            
            // Search across all accessible pages AND databases (remove filter to get both)
            const searchResponse = await notion.search({
                query: query,
                // No filter - this will search both pages and databases
                page_size: 20
            });

            console.log(`Found ${searchResponse.results.length} results`);
            const results = [];
            
            for (const item of searchResponse.results) {
                try {
                    console.log(`Processing ${item.object}: ${this.getPageTitle(item)}`);
                    
                    if (item.object === 'page') {
                        // Handle regular pages
                        const blocks = await notion.blocks.children.list({
                            block_id: item.id
                        });
                        
                        const content = await this.extractTextFromBlocks(blocks.results);
                        
                        if (content.trim()) {
                            results.push({
                                id: item.id,
                                title: this.getPageTitle(item),
                                content: content,
                                url: item.url || '#',
                                relevance: this.calculateRelevance(query, content)
                            });
                        }
                    } else if (item.object === 'database') {
                        // Handle databases - get entries from the database
                        console.log(`Found database: ${this.getPageTitle(item)}`);
                        
                        // Query the database for entries
                        const databaseEntries = await notion.databases.query({
                            database_id: item.id,
                            page_size: 10
                        });
                        
                        console.log(`Database has ${databaseEntries.results.length} entries`);
                        
                        // Process each database entry
                        for (const entry of databaseEntries.results) {
                            try {
                                const blocks = await notion.blocks.children.list({
                                    block_id: entry.id
                                });
                                
                                const content = await this.extractTextFromBlocks(blocks.results);
                                const entryTitle = this.getPageTitle(entry);
                                
                                if (content.trim() || entryTitle.toLowerCase().includes(query.toLowerCase())) {
                                    results.push({
                                        id: entry.id,
                                        title: `${entryTitle} (from ${this.getPageTitle(item)})`,
                                        content: content || entryTitle,
                                        url: entry.url || '#',
                                        relevance: this.calculateRelevance(query, content + ' ' + entryTitle)
                                    });
                                }
                            } catch (error) {
                                console.warn(`Could not fetch content for database entry ${entry.id}:`, error.message);
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Could not process item ${item.id}:`, error.message);
                }
            }
            
            // Also search specific known databases directly
            await this.searchKnownDatabases(query, results);
            
            // Sort by relevance
            results.sort((a, b) => b.relevance - a.relevance);
            return results.slice(0, 10); // Return top 10 most relevant
            
        } catch (error) {
            console.error('Error searching Notion:', error);
            throw new Error('Failed to search Notion content');
        }
    }
    
    async searchKnownDatabases(query, results) {
        // List of known database IDs from your workspace
        // You'll need to add these IDs for your specific databases
        const knownDatabases = [
            // Add your database IDs here, for example:
            // { id: 'database-id-here', name: 'File and Doc Hub' },
            // { id: 'database-id-here', name: 'Experiments' },
            // { id: 'database-id-here', name: 'Projects' },
        ];
        
        for (const db of knownDatabases) {
            try {
                console.log(`Searching known database: ${db.name}`);
                const dbResults = await notion.databases.query({
                    database_id: db.id,
                    filter: {
                        or: [
                            {
                                property: 'Name',
                                title: {
                                    contains: query
                                }
                            },
                            {
                                property: 'title',
                                title: {
                                    contains: query
                                }
                            }
                        ]
                    },
                    page_size: 5
                });
                
                for (const entry of dbResults.results) {
                    try {
                        const blocks = await notion.blocks.children.list({
                            block_id: entry.id
                        });
                        
                        const content = await this.extractTextFromBlocks(blocks.results);
                        const entryTitle = this.getPageTitle(entry);
                        
                        if (content.trim() || entryTitle) {
                            results.push({
                                id: entry.id,
                                title: `${entryTitle} (from ${db.name})`,
                                content: content || entryTitle,
                                url: entry.url || '#',
                                relevance: this.calculateRelevance(query, content + ' ' + entryTitle)
                            });
                        }
                    } catch (error) {
                        console.warn(`Could not fetch content for entry in ${db.name}:`, error.message);
                    }
                }
            } catch (error) {
                console.warn(`Could not search database ${db.name}:`, error.message);
            }
        }
    }

    async extractTextFromBlocks(blocks, depth = 0) {
        let text = '';
        const maxDepth = 3; // Prevent infinite recursion
        
        for (const block of blocks) {
            // Extract text from rich text arrays
            const extractRichText = (richText) => richText?.map(t => t.plain_text).join('') || '';
            
            switch (block.type) {
                case 'paragraph':
                    text += extractRichText(block.paragraph?.rich_text) + '\n\n';
                    break;
                case 'heading_1':
                    text += '# ' + extractRichText(block.heading_1?.rich_text) + '\n\n';
                    break;
                case 'heading_2':
                    text += '## ' + extractRichText(block.heading_2?.rich_text) + '\n\n';
                    break;
                case 'heading_3':
                    text += '### ' + extractRichText(block.heading_3?.rich_text) + '\n\n';
                    break;
                case 'bulleted_list_item':
                    text += '• ' + extractRichText(block.bulleted_list_item?.rich_text) + '\n';
                    break;
                case 'numbered_list_item':
                    text += '- ' + extractRichText(block.numbered_list_item?.rich_text) + '\n';
                    break;
                case 'toggle':
                    text += '▸ ' + extractRichText(block.toggle?.rich_text) + '\n';
                    break;
                case 'quote':
                    text += '> ' + extractRichText(block.quote?.rich_text) + '\n\n';
                    break;
                case 'code':
                    const codeText = extractRichText(block.code?.rich_text);
                    const language = block.code?.language || '';
                    text += `\`\`\`${language}\n${codeText}\n\`\`\`\n\n`;
                    break;
                case 'callout':
                    text += '💡 ' + extractRichText(block.callout?.rich_text) + '\n\n';
                    break;
                case 'table':
                    // Tables need special handling - skip for now but note it exists
                    text += '[TABLE EXISTS HERE]\n\n';
                    break;
                case 'divider':
                    text += '---\n\n';
                    break;
            }
            
            // Recursively get child blocks if they exist and we haven't hit max depth
            if (block.has_children && depth < maxDepth) {
                try {
                    const childBlocks = await notion.blocks.children.list({
                        block_id: block.id
                    });
                    const childText = await this.extractTextFromBlocks(childBlocks.results, depth + 1);
                    if (childText) {
                        text += '  ' + childText.replace(/\n/g, '\n  ') + '\n';
                    }
                } catch (error) {
                    console.warn(`Could not fetch child blocks for ${block.id}:`, error.message);
                }
            }
        }
        return text;
    }

    getPageTitle(page) {
        if (page.properties?.title?.title?.[0]?.plain_text) {
            return page.properties.title.title[0].plain_text;
        }
        if (page.properties?.Name?.title?.[0]?.plain_text) {
            return page.properties.Name.title[0].plain_text;
        }
        // Check for any title-like property
        for (const [key, value] of Object.entries(page.properties)) {
            if (value.type === 'title' && value.title?.[0]?.plain_text) {
                return value.title[0].plain_text;
            }
        }
        return 'Untitled';
    }

    calculateRelevance(query, content) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentWords = content.toLowerCase().split(/\s+/);
        let score = 0;
        
        queryWords.forEach(word => {
            const matches = contentWords.filter(contentWord => 
                contentWord.includes(word) || word.includes(contentWord)
            ).length;
            score += matches;
        });
        
        return score / Math.max(contentWords.length, 1);
    }

    async generateResponse(query, context, conversationHistory = []) {
        try {
            const systemPrompt = `You are an AI assistant for the James M. Jordan Laboratory. You help visitors find information about the lab's research, publications, team members, and resources.

Use the provided context from the lab's Notion workspace to answer questions accurately. If the context doesn't contain relevant information, say so and suggest what topics you can help with.

Always be helpful, professional, and accurate. When citing information, mention that it comes from the lab's documentation.

Context from lab documentation:
${context}`;

            // Build messages array with conversation history
            const messages = [
                { role: "system", content: systemPrompt },
                ...conversationHistory,
                { role: "user", content: query }
            ];

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",  // Using GPT-4o-mini as requested
                messages: messages,
                max_tokens: 1000,  // Increased for more detailed responses
                temperature: 0.7
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error generating OpenAI response:', error);
            throw new Error('Failed to generate response');
        }
    }

    async processQuery(query, conversationHistory = []) {
        try {
            // Search for relevant content in Notion
            const searchResults = await this.searchNotionContent(query);
            
            // Prepare context for OpenAI
            const context = searchResults
                .map(result => `Title: ${result.title}\nContent: ${result.content}`)
                .join('\n\n---\n\n');
            
            // Generate response using OpenAI
            const answer = await this.generateResponse(query, context, conversationHistory);
            
            // Format sources
            const sources = searchResults.map(result => ({
                title: result.title,
                url: result.url,
                snippet: result.content.substring(0, 150) + '...'
            }));
            
            return {
                answer,
                sources,
                success: true
            };
            
        } catch (error) {
            console.error('Error processing query:', error);
            return {
                answer: "I'm sorry, I encountered an error while processing your request. Please try again or contact the lab directly.",
                sources: [],
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize RAG service
const ragService = new RAGService();

// Store conversation history per session (in production, use proper session management)
const conversationHistory = new Map();

// API Routes
app.post('/api/chat', async (req, res) => {
    try {
        const { query, sessionId = 'default' } = req.body;
        
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({
                error: 'Query is required and must be a non-empty string'
            });
        }

        // Get or create conversation history for this session
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, []);
        }
        const history = conversationHistory.get(sessionId);

        const result = await ragService.processQuery(query.trim(), history);
        
        // Update conversation history
        history.push({ role: 'user', content: query });
        history.push({ role: 'assistant', content: result.answer });
        
        // Keep only last 10 messages to prevent context overflow
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            notion: !!process.env.NOTION_TOKEN,
            openai: !!process.env.OPENAI_API_KEY
        }
    });
});

// Debug endpoint to list all accessible content
app.get('/api/debug/notion-content', async (req, res) => {
    try {
        console.log('Fetching all accessible Notion content...');
        
        // Search without query to get all accessible content
        const searchResponse = await notion.search({
            page_size: 100
        });
        
        const content = {
            total: searchResponse.results.length,
            databases: [],
            pages: []
        };
        
        for (const item of searchResponse.results) {
            if (item.object === 'database') {
                const dbInfo = {
                    id: item.id,
                    title: ragService.getPageTitle(item),
                    created: item.created_time,
                    url: item.url
                };
                
                try {
                    // Get a sample of entries from this database
                    const entries = await notion.databases.query({
                        database_id: item.id,
                        page_size: 5
                    });
                    
                    dbInfo.entryCount = entries.results.length;
                    dbInfo.sampleEntries = entries.results.map(entry => ({
                        title: ragService.getPageTitle(entry),
                        id: entry.id
                    }));
                } catch (error) {
                    dbInfo.error = error.message;
                }
                
                content.databases.push(dbInfo);
            } else if (item.object === 'page') {
                content.pages.push({
                    id: item.id,
                    title: ragService.getPageTitle(item),
                    created: item.created_time,
                    url: item.url
                });
            }
        }
        
        res.json(content);
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({
            error: 'Failed to fetch Notion content',
            message: error.message
        });
    }
});

// Serve static files (your existing website)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Jordan Lab RAG Server running on http://localhost:${PORT}`);
    console.log(`✅ Notion integration: ${process.env.NOTION_TOKEN ? 'Connected' : 'Not configured'}`);
    console.log(`✅ OpenAI integration: ${process.env.OPENAI_API_KEY ? 'Connected' : 'Not configured'}`);
});

module.exports = app; 