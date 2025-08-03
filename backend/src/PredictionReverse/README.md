# PredictionReverse API

This module provides API endpoints for reverse prediction - predicting study habits (weekly study hours and attendance percentage) from academic performance and other factors.

## API Endpoints

### POST /api/prediction-reverse
Create a new reverse prediction by calling the ML service and saving results to database.

**Headers:**
- `user-id`: User ID (optional, defaults to 1)

**Request Body:**
```json
{
  "year": "2024",
  "semesterNumber": 1,
  "courseCode": "MATH101",
  "studyFormat": "LEC",
  "creditsUnit": 3,
  "rawScore": 8.5,
  "partTimeHours": 20,
  "financialSupport": 2,
  "emotionalSupport": 3
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "year": "2024",
  "semesterNumber": 1,
  "courseCode": "MATH101",
  "studyFormat": "LEC",
  "creditsUnit": 3,
  "rawScore": 8.5,
  "partTimeHours": 20,
  "financialSupport": 2,
  "emotionalSupport": 3,
  "financialSupportXPartTime": 40,
  "rawScoreXPartTime": 170,
  "rawScoreXFinancial": 17,
  "rawScoreXEmotional": 25.5,
  "rawScoreXPartTimeFinancial": 340,
  "predictedWeeklyStudyHours": 15.2341,
  "predictedAttendancePercentage": 85.7892,
  "mode": "reverse",
  "createdAt": "2025-08-03T10:00:00.000Z",
  "updatedAt": "2025-08-03T10:00:00.000Z"
}
```

### GET /api/prediction-reverse
Get all reverse predictions for a user.

**Headers:**
- `user-id`: User ID (optional, defaults to 1)

**Response:**
Array of prediction objects (same structure as POST response)

### GET /api/prediction-reverse/:id
Get a specific reverse prediction by ID.

**Headers:**
- `user-id`: User ID (optional, defaults to 1)

**Parameters:**
- `id`: Prediction ID

**Response:**
Single prediction object (same structure as POST response)

### DELETE /api/prediction-reverse/:id
Delete a specific reverse prediction.

**Headers:**
- `user-id`: User ID (optional, defaults to 1)

**Parameters:**
- `id`: Prediction ID

**Response:**
```json
{
  "message": "Reverse prediction deleted successfully"
}
```

## ML Service Integration

The API calls the FastAPI ML service at `http://localhost:8000/reverse` with the following payload:

```json
{
  "semester_number": 1,
  "course_code": "MATH101",
  "study_format": "LEC",
  "credits_unit": 3,
  "raw_score": 8.5,
  "part_time_hours": 20,
  "financial_support": 2,
  "emotional_support": 3
}
```

The ML service returns:
```json
{
  "mode": "reverse_prediction",
  "predicted_weekly_study_hours": 15.2341,
  "predicted_attendance_percentage": 85.7892
}
```

## Database Schema

The predictions are stored in the `PredictionInputReverse` table with calculated interaction features:
- `financialSupportXPartTime`: financial_support * part_time_hours
- `rawScoreXPartTime`: raw_score * part_time_hours
- `rawScoreXFinancial`: raw_score * financial_support
- `rawScoreXEmotional`: raw_score * emotional_support
- `rawScoreXPartTimeFinancial`: raw_score * (financial_support * part_time_hours)

## Usage

1. Start the ML service:
```bash
cd ml_service
uvicorn predictpytorchdemo2:app --reload --port 8000
```

2. Start the backend:
```bash
cd backend
npm run start:dev
```

3. Make API calls to create reverse predictions, which will automatically call the ML service and save results to the database.
