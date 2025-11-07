import { Router } from 'express';
import { vannaAI } from '../services/vanna-ai';

const router = Router();

// Chat with Data - Vanna AI Integration
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(503).json({ 
        error: 'AI service not configured',
        message: 'Please set GROQ_API_KEY in backend/.env file. Get your free API key from https://console.groq.com'
      });
    }

    // Use Vanna AI to process the query
    const response = await vannaAI.chatWithData(query);

    res.json(response);
  } catch (error) {
    console.error('Error processing chat query:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as chatWithDataRouter };