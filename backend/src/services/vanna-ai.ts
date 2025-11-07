import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const prisma = new PrismaClient();

// Database schema context for the LLM
const DATABASE_SCHEMA = `
You are a SQL expert. Generate PostgreSQL queries based on user questions about invoice data.

DATABASE SCHEMA:
---------------

Table: documents
- id: TEXT (Primary Key, cuid)
- externalId: TEXT (Unique)
- name: TEXT
- filePath: TEXT
- fileSize: TEXT
- fileType: TEXT
- status: TEXT
- organizationId: TEXT
- departmentId: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
- processedAt: TIMESTAMP (nullable)
- analyticsId: TEXT (nullable)

Table: invoices
- id: TEXT (Primary Key, cuid)
- documentId: TEXT (Foreign Key -> documents.id, Unique)
- invoiceId: TEXT
- invoiceDate: TIMESTAMP
- deliveryDate: TIMESTAMP (nullable)

Table: vendors
- id: TEXT (Primary Key, cuid)
- documentId: TEXT (Foreign Key -> documents.id, Unique)
- vendorName: TEXT
- vendorAddress: TEXT
- vendorTaxId: TEXT (nullable)
- vendorPartyNumber: TEXT (nullable)

Table: customers
- id: TEXT (Primary Key, cuid)
- documentId: TEXT (Foreign Key -> documents.id, Unique)
- customerName: TEXT
- customerAddress: TEXT
- customerTaxId: TEXT (nullable)

Table: summaries
- id: TEXT (Primary Key, cuid)
- documentId: TEXT (Foreign Key -> documents.id, Unique)
- documentType: TEXT (nullable)
- subTotal: FLOAT
- totalTax: FLOAT
- invoiceTotal: FLOAT
- currencySymbol: TEXT (nullable)

Table: payments
- id: TEXT (Primary Key, cuid)
- documentId: TEXT (Foreign Key -> documents.id, Unique)
- dueDate: TIMESTAMP (nullable)
- paymentTerms: TEXT (nullable)
- bankAccountNumber: TEXT (nullable)
- bic: TEXT (nullable)
- accountName: TEXT (nullable)
- netDays: INTEGER (nullable)
- discountPercentage: FLOAT (nullable)
- discountDays: INTEGER (nullable)
- discountDueDate: TIMESTAMP (nullable)

Table: line_items
- id: TEXT (Primary Key, cuid)
- documentId: TEXT (Foreign Key -> documents.id)
- srNo: INTEGER
- description: TEXT
- quantity: FLOAT
- unitPrice: FLOAT
- totalPrice: FLOAT
- sachkonto: TEXT (nullable)
- buschluessel: TEXT (nullable)
- vatRate: FLOAT (nullable)
- vatAmount: FLOAT (nullable)

IMPORTANT EXAMPLES:
-------------------

Example 1 - Total spend this year:
SELECT SUM("invoiceTotal")::float as total_spend
FROM summaries s
JOIN documents d ON s."documentId" = d.id
WHERE EXTRACT(YEAR FROM d."createdAt") = EXTRACT(YEAR FROM CURRENT_DATE)

Example 2 - Top 5 vendors by total spend:
SELECT v."vendorName", SUM(s."invoiceTotal")::float as total_spend
FROM vendors v
JOIN summaries s ON v."documentId" = s."documentId"
GROUP BY v."vendorName"
ORDER BY total_spend DESC
LIMIT 5

Example 3 - Invoices over 1000 euros:
SELECT i."invoiceId", v."vendorName", s."invoiceTotal", i."invoiceDate"
FROM invoices i
JOIN vendors v ON i."documentId" = v."documentId"
JOIN summaries s ON i."documentId" = s."documentId"
WHERE s."invoiceTotal" > 1000
ORDER BY s."invoiceTotal" DESC

RULES:
1. Always use double quotes for column names (PostgreSQL): "vendorName", "invoiceTotal", etc.
2. Use CAST(...::float) for numeric aggregations: SUM("invoiceTotal")::float
3. Use TO_CHAR for date formatting: TO_CHAR("invoiceDate", 'YYYY-MM-DD')
4. Join tables using "documentId" (with quotes)
5. For dates, use documents.createdAt (not uploadDate which doesn't exist)
6. Column names are camelCase, not snake_case
7. Return only the SQL query, no explanations in the SQL
8. Use EXTRACT(YEAR FROM ...) for year filtering
9. Always include double quotes around column names
`;

export interface VannaResponse {
  query: string;
  sql: string;
  results: any[];
  explanation: string;
  rowCount: number;
}

export class VannaAI {
  async generateSQL(userQuery: string): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: DATABASE_SCHEMA,
          },
          {
            role: 'user',
            content: `Generate a PostgreSQL query for: ${userQuery}\n\nReturn ONLY the SQL query, no markdown, no explanations, no code blocks.`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 500,
      });

      let sql = chatCompletion.choices[0]?.message?.content || '';
      
      // Clean up the SQL
      sql = sql.trim()
        .replace(/```sql/g, '')
        .replace(/```/g, '')
        .replace(/;$/g, '')
        .trim();

      return sql;
    } catch (error) {
      console.error('Error generating SQL:', error);
      throw new Error('Failed to generate SQL query');
    }
  }

  async executeSQL(sql: string): Promise<any[]> {
    try {
      const results = await prisma.$queryRawUnsafe(sql);
      return Array.isArray(results) ? results : [results];
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw new Error(`SQL execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateExplanation(userQuery: string, sql: string, results: any[]): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that explains SQL query results in simple terms.',
          },
          {
            role: 'user',
            content: `User asked: "${userQuery}"\n\nSQL generated: ${sql}\n\nResults (${results.length} rows): ${JSON.stringify(results.slice(0, 3))}\n\nProvide a concise, business-friendly explanation of these results.`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200,
      });

      return chatCompletion.choices[0]?.message?.content || 'Query executed successfully.';
    } catch (error) {
      console.error('Error generating explanation:', error);
      return `Found ${results.length} results for your query.`;
    }
  }

  async chatWithData(userQuery: string): Promise<VannaResponse> {
    try {
      console.log(`Processing query: "${userQuery}"`);

      // Step 1: Generate SQL using Groq LLM
      const sql = await this.generateSQL(userQuery);
      console.log(`Generated SQL: ${sql}`);

      // Step 2: Execute the SQL
      const results = await this.executeSQL(sql);
      console.log(`Executed, found ${results.length} rows`);

      // Step 3: Generate natural language explanation
      const explanation = await this.generateExplanation(userQuery, sql, results);

      return {
        query: userQuery,
        sql,
        results,
        explanation,
        rowCount: results.length,
      };
    } catch (error) {
      console.error('Chat with data error:', error);
      throw error;
    }
  }
}

export const vannaAI = new VannaAI();
