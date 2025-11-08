'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Database, Sparkles, Trash2, Download, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sql?: string;
  results?: Record<string, unknown>[];
  rowCount?: number;
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const STORAGE_KEY = 'chat-history';
  
  const initialMessage: ChatMessage = {
    id: '1',
    type: 'assistant',
    content: 'Hello! I can help you analyze your invoice data using natural language. Try asking questions like:\n\n- "Show me the top 5 vendors by total spend"\n- "What is the total invoice amount for last month?"\n- "List all invoices from CPB SOFTWARE"\n- "What is the average invoice value?"',
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return [initialMessage];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatMessage[];
        return parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch {
        return [initialMessage];
      }
    }
    return [initialMessage];
  });
  const [input, setInput] = useState('');

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const clearHistory = () => {
    setMessages([initialMessage]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = String(value ?? '');
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chatMutation = useMutation({
    mutationFn: (query: string) => apiService.chatWithData(query),
    onSuccess: (data, query) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: query,
        timestamp: new Date(),
      };

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.explanation || 'Query executed successfully.',
        sql: data.sql,
        results: data.results,
        rowCount: data.rowCount,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput('');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: error.response?.data?.message || error.message || 'Failed to process your query. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;
    chatMutation.mutate(input.trim());
  };

  const suggestedQueries = [
    'Show me the top 5 vendors by total spend',
    'What is the total spend this year?',
    'List all invoices over 1000 euros',
    'Which vendor has the most invoices?',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Chat with Your Data</h1>
                <p className="text-sm text-muted-foreground">
                  Ask questions about your invoice data in natural language. Powered by Groq LLM.
                </p>
              </div>
            </div>
            {messages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Chat Container */}
        <Card className="h-[calc(100vh-200px)] flex flex-col shadow-lg">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6 max-w-5xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-5 shadow-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border'
                    }`}
                  >
                    {/* Message Content */}
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

                    {/* SQL Query Display */}
                    {message.sql && (
                      <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-primary">
                          <Database className="h-3.5 w-3.5" />
                          Generated SQL Query
                        </div>
                        <code className="text-xs font-mono block overflow-x-auto">{message.sql}</code>
                      </div>
                    )}

                    {/* Results Display */}
                    {message.results && message.results.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold">
                            Query Results
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                              {message.rowCount} {message.rowCount === 1 ? 'row' : 'rows'}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportToCSV(message.results!, `query-results-${Date.now()}`)}
                              className="h-7 px-3 text-xs gap-1"
                            >
                              <Download className="h-3 w-3" />
                              CSV
                            </Button>
                          </div>
                        </div>
                        <div className="bg-background rounded-lg border border-border overflow-hidden">
                          <div className="overflow-x-auto">
                            <div className="max-h-96 overflow-y-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50 sticky top-0">
                                  <tr className="border-b border-border">
                                    {Object.keys(message.results[0]).map((key) => (
                                      <th key={key} className="text-left p-3 font-semibold text-foreground whitespace-nowrap">
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {message.results.slice(0, 50).map((row, idx) => (
                                    <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                                      {Object.values(row).map((val: unknown, i) => (
                                        <td key={i} className="p-3 whitespace-nowrap">
                                          {typeof val === 'number' 
                                            ? val.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                            : String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          {message.results.length > 50 && (
                            <div className="text-xs text-muted-foreground p-2 text-center bg-muted/30 border-t border-border">
                              Showing first 50 of {message.results.length} rows
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs opacity-60 mt-3 font-medium">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <div>
                        <div className="text-sm font-medium">Processing your question...</div>
                        <div className="text-xs text-muted-foreground">Generating SQL and fetching results</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Queries */}
          {messages.length === 1 && (
            <div className="border-t px-6 py-3 bg-muted/20">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Suggested Questions:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQueries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!chatMutation.isPending) {
                          chatMutation.mutate(query);
                        }
                      }}
                      disabled={chatMutation.isPending}
                      className="text-left px-3 py-2 rounded-md border border-border bg-card hover:bg-primary/5 hover:border-primary transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t px-6 py-4 bg-card">
            <div className="max-w-5xl mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your invoice data..."
                  disabled={chatMutation.isPending}
                  className="flex-1 h-12 text-base"
                />
                <Button 
                  type="submit" 
                  disabled={chatMutation.isPending || !input.trim()}
                  className="h-12 px-8 text-base font-medium"
                  size="lg"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
