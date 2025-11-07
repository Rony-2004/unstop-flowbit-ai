import { VannaAI } from '../services/vanna-ai';

describe('VannaAI Service', () => {
  let vannaAI: VannaAI;

  beforeEach(() => {
    vannaAI = new VannaAI();
  });

  describe('generateSQL', () => {
    it('should generate SQL query from natural language', async () => {
      const query = 'Show me the top 5 vendors';
      const sql = await vannaAI.generateSQL(query);
      
      expect(sql).toBeTruthy();
      expect(typeof sql).toBe('string');
      expect(sql.toUpperCase()).toContain('SELECT');
    }, 10000);

    it('should handle vendor queries', async () => {
      const query = 'Get vendors by spend';
      const sql = await vannaAI.generateSQL(query);
      
      expect(sql.toUpperCase()).toContain('VENDOR');
    }, 10000);
  });

  describe('SQL sanitization', () => {
    it('should remove markdown code blocks', async () => {
      const query = 'List all invoices';
      const sql = await vannaAI.generateSQL(query);
      
      expect(sql).not.toContain('```');
      expect(sql).not.toContain('sql');
    }, 10000);
  });
});
