# PredictionInputScore Module

This module handles the forward prediction input scores for the academic prediction system.

## Features

- Create prediction input scores manually
- Create prediction input scores from reverse prediction results
- Get all prediction input scores for a user
- Get specific prediction input score by ID
- Delete prediction input scores

## API Endpoints

### POST /api/prediction-input-score
Create a new prediction input score manually.

### POST /api/prediction-input-score/from-reverse
Create a prediction input score from a reverse prediction result.
This endpoint maps:
- `predictedWeeklyStudyHours` → `weeklyStudyHours`
- `predictedAttendancePercentage` → `attendancePercentage`

### GET /api/prediction-input-score
Get all prediction input scores for the authenticated user.

### GET /api/prediction-input-score/:id
Get a specific prediction input score by ID.

### DELETE /api/prediction-input-score/:id
Delete a prediction input score by ID.

## Data Flow

1. User completes reverse prediction in TutorialPrediction page
2. When user clicks "Tiếp tục →", the system:
   - Gets the latest reverse prediction results
   - Creates a new forward prediction input using those results
   - Maps predicted values to input values for forward prediction
   - Navigates to the next page

## Database Schema

The module uses the `PredictionInputScore` table with calculated interaction features for machine learning predictions.
