# Chat with Data - AI Setup Guide

## Overview
The "Chat with Data" feature uses **Groq LLM** (Llama 3.3 70B) to convert natural language questions into SQL queries and execute them against your invoice database.

## Setup Instructions

### 1. Get Your Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your API key

### 2. Configure Backend

1. Open `backend/.env` file
2. Replace the placeholder with your actual API key:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

3. Save the file
4. Restart the backend server:

```bash
cd backend
npm run dev
```

### 3. Access Chat Interface

1. Open your browser at http://localhost:8080
2. Click **"Chat with Data"** in the sidebar
3. Start asking questions!

## Example Questions

- "Show me the top 5 vendors by total spend"
- "What is the total invoice amount for this year?"
- "List all invoices from CPB SOFTWARE"
- "What is the average invoice value?"
- "Show me invoices over 1000 euros"
- "Which vendor has the most invoices?"
- "What is the total spend by currency?"

## How It Works

1. **User Input**: You type a natural language question
2. **SQL Generation**: Groq LLM converts your question to a PostgreSQL query
3. **Execution**: The query runs against your Neon database
4. **Results**: Data is displayed in a table with an AI-generated explanation

## Tech Stack

- **LLM**: Groq (Llama 3.3 70B Versatile)
- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL (Neon)
- **Frontend**: React + TypeScript + TailwindCSS
- **ORM**: Prisma

## Features

✅ Natural language to SQL conversion
✅ Real-time query execution
✅ Results displayed in tables
✅ SQL query visibility
✅ AI-generated explanations
✅ Conversation history
✅ Suggested queries
✅ Error handling

## Troubleshooting

### "AI service not configured" error
- Make sure `GROQ_API_KEY` is set in `backend/.env`
- Restart the backend server after adding the key

### Rate limits
- Groq free tier has generous limits (30 requests/minute)
- For production, consider upgrading to a paid plan

### Query errors
- The AI is trained on the database schema
- Be specific in your questions
- Use proper terminology (vendors, invoices, amounts)

## Security Notes

⚠️ **Never commit your API key to version control**
⚠️ **Add `.env` to `.gitignore`**
⚠️ **Use environment variables in production**

---

Built with ❤️ for Flowbit AI Assignment
