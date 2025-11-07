# Testing Documentation

## Overview

This project includes comprehensive unit tests for both backend API endpoints and AI services.

## Test Structure

```
backend/src/__tests__/
├── stats.test.ts          # Stats API endpoint tests
├── vendors.test.ts        # Vendors API endpoint tests
└── vanna-ai.test.ts       # AI service tests
```

## Running Tests

### All Tests
```bash
cd backend
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Suites

### 1. Stats API Tests (stats.test.ts)

Tests for `/api/stats` endpoint:

**Test Cases:**
- Should return stats data with correct properties
- Should return valid numeric values
- All values should be non-negative
- Response should match expected schema

**Coverage:**
- Response structure validation
- Data type checking
- Business logic validation

### 2. Vendors API Tests (vendors.test.ts)

Tests for `/api/vendors/top10` endpoint:

**Test Cases:**
- Should return top 10 vendors
- Should include required fields (vendorName, totalSpend)
- Should order vendors by spend (descending)
- Should handle empty results gracefully

**Coverage:**
- Array length validation
- Field existence checks
- Sorting logic verification
- Edge case handling

### 3. Vanna AI Tests (vanna-ai.test.ts)

Tests for AI-powered SQL generation:

**Test Cases:**
- Should generate SQL from natural language
- Should include SELECT statements
- Should handle vendor-specific queries
- Should sanitize markdown code blocks
- Should remove SQL formatting artifacts

**Coverage:**
- SQL generation logic
- Query parsing
- String sanitization
- Error handling

## Test Configuration

### Jest Configuration (jest.config.js)
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ]
}
```

### TypeScript Support
- Tests written in TypeScript
- Full type checking enabled
- Uses ts-jest for compilation

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern
```typescript
it('should return stats data', async () => {
  // Arrange: Setup test data
  const app = createTestApp();
  
  // Act: Execute the test
  const response = await request(app).get('/api/stats');
  
  // Assert: Verify results
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('totalSpend');
});
```

### 2. Test Isolation
- Each test is independent
- No shared state between tests
- Clean setup and teardown

### 3. Meaningful Test Names
- Descriptive test names
- Clear expected behavior
- Easy to understand failures

## Coverage Goals

Target coverage metrics:
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## Continuous Integration

### GitHub Actions Integration
```yaml
- name: Run tests
  run: |
    cd backend
    npm test
    npm run test:coverage
```

### Pre-commit Hooks
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "cd backend && npm test"
```

## Mocking

### Database Mocking
```typescript
// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $queryRaw: jest.fn(),
  })),
}));
```

### API Mocking with Supertest
```typescript
import request from 'supertest';
import express from 'express';

const app = express();
app.use('/api/stats', statsRouter);

const response = await request(app)
  .get('/api/stats')
  .expect(200);
```

## Test Data

### Fixtures
- Sample invoice data
- Test vendors
- Mock query responses

### Data Factories
```typescript
const createMockVendor = (overrides = {}) => ({
  vendorName: 'Test Vendor',
  totalSpend: 1000,
  ...overrides,
});
```

## Error Testing

### Testing Error Handling
```typescript
it('should handle database errors', async () => {
  prisma.$queryRaw.mockRejectedValue(new Error('DB Error'));
  
  const response = await request(app)
    .get('/api/stats')
    .expect(500);
    
  expect(response.body).toHaveProperty('error');
});
```

## Performance Testing

### Response Time Tests
```typescript
it('should respond within 1 second', async () => {
  const start = Date.now();
  await request(app).get('/api/stats');
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(1000);
});
```

## Debugging Tests

### Running Single Test
```bash
npm test -- --testNamePattern="should return stats data"
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Future Test Improvements

1. Integration tests for full API flows
2. E2E tests with Playwright
3. Load testing with k6
4. Security testing with OWASP ZAP
5. Contract testing for API versioning

## Test Metrics

Track these metrics:
- Test execution time
- Coverage percentage
- Number of tests per module
- Flaky test rate
- Test maintenance cost

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

For questions about testing, create an issue with the `testing` label.
