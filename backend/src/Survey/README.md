# Survey Question Management API

This module provides CRUD operations for managing survey questions in the SIC_AI system.

## Endpoints

### 1. Get All Questions
```http
GET /api/survey-questions
```
**Response:**
```json
[
  {
    "id": 1,
    "text": "How much financial support do you receive?",
    "category": "FINANCIAL",
    "options": ["None", "Low", "Medium", "High"],
    "isActive": true,
    "createdAt": "2025-08-02T10:00:00.000Z",
    "updatedAt": "2025-08-02T10:00:00.000Z"
  }
]
```

### 2. Get Active Questions Only
```http
GET /api/survey-questions/active
```
Returns only questions where `isActive: true`. Same response format as above.

### 3. Get Single Question
```http
GET /api/survey-questions/:id
```
**Response:** Single question object (same format as above)

### 4. Create New Question
```http
POST /api/survey-questions
Content-Type: application/json

{
  "text": "Your question text here",
  "category": "GENERAL", // "GENERAL" | "EMOTIONAL" | "FINANCIAL"
  "options": ["Option 1", "Option 2", "Option 3"]
}
```
**Response:** Created question object

### 5. Delete Question
```http
DELETE /api/survey-questions/:id
```
**Response:** 204 No Content

⚠️ **Note:** This also deletes all related survey answers.

### 6. Toggle Question Active Status
```http
PATCH /api/survey-questions/:id/toggle
```
**Response:** Updated question object with toggled `isActive` status

## Data Model

### SurveyQuestion
```typescript
interface SurveyQuestion {
  id: number;
  text: string;
  category: "GENERAL" | "EMOTIONAL" | "FINANCIAL";
  options: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Validation Rules

- `text`: Required string, cannot be empty
- `category`: Must be one of: "GENERAL", "EMOTIONAL", "FINANCIAL"
- `options`: Required array of strings, each option must be a non-empty string

## Error Handling

- **404 Not Found**: When trying to access, update, or delete a non-existent question
- **400 Bad Request**: When validation fails (missing required fields, invalid category, etc.)
- **500 Internal Server Error**: For database connection issues or other server errors

## Frontend Integration

The frontend Survey Dashboard (`SurveyDashBoard.tsx`) is already configured to work with these endpoints. Make sure your backend is running on port 3000 and that CORS is properly configured if frontend and backend are on different ports.

## Testing

Run the unit tests:
```bash
npm test -- survey.controller.spec.ts
```

## Database Schema

The backend uses Prisma ORM with the following database model:

```prisma
model SurveyQuestion {
  id        Int              @id @default(autoincrement())
  text      String
  category  QuestionCategory
  options   String[]
  isActive  Boolean          @default(true)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  answers   SurveyAnswer[]
}

enum QuestionCategory {
  EMOTIONAL
  FINANCIAL
  GENERAL
}
```
