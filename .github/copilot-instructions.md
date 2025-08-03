# SIC_AI Copilot Instructions

This is an academic grade prediction system combining NestJS backend, React frontend, and PyTorch ML service. The system predicts student academic performance using historical grades and personal factors with **bidirectional prediction capabilities**.

## Architecture Overview

**Three-tier microservices architecture:**
- `backend/` - NestJS API (port 3000) with Prisma ORM → PostgreSQL  
- `frontend/` - React + TypeScript + Vite SPA (port 5173) with survey forms and predictions
- `ml_service/` - FastAPI service (port 8000) with PyTorch models for bidirectional prediction

**Data flow:** Frontend collects survey responses → Backend stores via Prisma → ML service processes with PyTorch → Results returned to frontend

**Critical note:** ML service integration exists via HTTP calls but is not fully integrated with prediction workflows. Backend includes Gemini AI integration for survey analysis.

## Key Data Models (Prisma Schema)

The system uses six main models representing the prediction and survey pipeline:

```typescript
// Raw academic records imported from student systems  
ScoreRecord: { userId, studentId, year, semesterNumber, courseCode, rawScore, convertedScore }

// Reverse prediction: given grades, predict study habits
PredictionInputReverse: { userId, year, semesterNumber, courseCode, rawScore, partTimeHours, 
                         financialSupport, emotionalSupport, predictedWeeklyStudyHours, 
                         predictedAttendancePercentage, mode: "reverse" }

// Forward prediction: given study habits, predict grades
PredictionInputScore: { userId, reverseInputId?, year, semesterNumber, weeklyStudyHours, 
                       attendancePercentage, partTimeHours, mode: "forward" }

// Final prediction results linked to inputs
PredictedScore: { userId, inputScoreId, scoreRecordId?, predictedScore }

// Survey system for collecting student responses
SurveyQuestion: { text, category: "EMOTIONAL"|"FINANCIAL"|"GENERAL", options, isActive, allowMultiple }
SurveyResponse: { userId, submittedAt, answers[] }
SurveyAnalysisResult: { userId, emotionalLevel, financialLevel } // AI-analyzed support levels
```

**Critical patterns:** 
- The `mode` field determines prediction direction - always set to "reverse" or "forward"
- All models include `year` field for academic year tracking (added in latest migration)
- Feature engineering fields (like `rawScoreXPartTime`) are pre-computed and stored

## Development Workflows

**Backend setup:**
```powershell
cd backend
npm install
npx prisma generate    # Generate Prisma client after schema changes
cd e:\SIC_AI\backend; npm run start:dev     # Starts NestJS on port 3000 with hot reload
```
**Frontend development:**
```powershell
cd frontend  
npm install
cd e:\SIC_AI\frontend; npm run dev            # Starts Vite dev server on port 5173
```

**ML service:**
```powershell
cd ml_service
# pip install -r requirements.txt
uvicorn predictpytorchdemo2:app --reload --port 8000
```

**Database management:**
- Always run `npx prisma db push` or `npx prisma migrate dev` after schema changes
- Use `npx prisma studio` to browse data during development
- Check migrations in `prisma/migrations/` for database evolution history

**CORS configuration:** Backend allows `http://localhost:5173`, ML service allows all origins (`allow_origins=["*"]`)

## ML Service Integration Patterns

**Two prediction endpoints:**
- `/predict` - Forward prediction (study habits → grades)
- `/reverse` - Reverse prediction (grades → study habits) 

**Model files naming convention:**
- `best_mlp_model_2output_2_8_2025.pt` - PyTorch model weights
- `best_mlp_model_weighted_2_8_2025.pt` - PyTorch model weights
- `preprocessing_pipeline_2_8_2025.joblib` - Scikit-learn preprocessors
- `preprocessing_pipeline_reverse_2_8_2025_1.joblib` - Scikit-learn preprocessors
- Models are loaded at startup, not per-request

**Feature engineering pattern:** All interaction features (like `study_hours_x_part_part_time_hours`) are pre-computed and stored, not calculated on-demand

## Frontend Survey Flow

The survey system in `SurveyPage.tsx` follows this pattern:
1. User authentication check via `localStorage.getItem('user')`
2. Fetch active questions from backend (`/api/survey-questions/active`)
3. Questions sorted by category: EMOTIONAL → FINANCIAL → GENERAL
4. 10 hardcoded questions about financial/emotional support (0-3 scale)
5. POST transformed data to `/api/survey-responses`
6. Results displayed immediately after submission

**Authentication pattern:** LocalStorage stores user object, redirects to `/login` if missing
**Routing structure:**
- `/` - Landing page (`Home.tsx`) - wrapped in `MainLayout`
- `/login`, `/register` - Authentication (standalone, no layout)
- `/survey`, `/complete` - Survey flow (standalone, no layout wrapper)
- `/survey-history` - User's past responses

## Database Schema Conventions

**Foreign key pattern:** All models reference `User.id` with `userId` field
**Timestamp pattern:** Every model has `createdAt` and `updatedAt` (Prisma auto-managed)
**Nullable relationships:** Use `scoreRecordId?` for optional links between predictions and historical records

## Component Patterns

**CSS co-location:** Each page component has its own `.css` file (e.g., `Home.tsx` + `Home.css`)
**Asset imports:** Images stored in `src/assets/` and imported as ES modules
**State management:** useState for local form state, no global state management

## External Service Integration

**Gemini AI for Survey Analysis:**
- Backend uses `axios` to call Google's Gemini API in `survey-analysis.service.ts`
- Requires `GEMINI_API_KEY` environment variable
- Automatically analyzes survey responses to extract emotional/financial support levels
- Pattern: Sends formatted survey answers → Gemini returns JSON with numeric scores (0-3 scale)

**ML Service Communication:**
- Endpoints: `/predict` (forward) and `/reverse` (reverse prediction)
- Models: `best_mlp_model_2output_2_8_2025.pt` with separate preprocessors
- Backend ready for HTTP integration but not yet connected to prediction workflows

## Critical Integration Points

**Database connection:** Uses environment variable `DATABASE_URL` for PostgreSQL connection
**Frontend API:** Axios instance configured for `http://localhost:3000` with credentials enabled
**CORS configuration:** ML service allows all origins (`allow_origins=["*"]`) - restrict in production
**Module structure:** Backend uses NestJS modules (User, Survey, ScoreRecord, PredictionReverse, etc.) with shared PrismaService

## Testing & Quality

**Backend:** Jest tests in `test/` directory, run with `npm test`
**Frontend:** ESLint configuration in `eslint.config.js`
**Type safety:** Full TypeScript coverage in both frontend and backend

When making changes, always consider the bidirectional nature of predictions and ensure the `mode` field correctly identifies the prediction direction.
