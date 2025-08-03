# PredictedScore Module

This module provides functionality to automatically generate predictions for student scores using machine learning models. It fetches prepared data from `PredictionInputScore`, sends it to the ML API, and stores the predictions in `PredictedScore`.

## API Endpoints

### POST `/predicted-score/populate`

Triggers the automatic prediction process for all eligible records.

**Process:**
1. Fetches all records from `PredictionInputScore` that have complete data (non-null required fields)
2. Filters out records that already have predictions (avoids duplicates)
3. For each record, sends a POST request to the ML API at `http://localhost:8000/predict`
4. Receives predicted score and converts it to letter grade
5. Saves the prediction to `PredictedScore` table

**Response:**
```json
{
  "message": "Prediction population completed",
  "summary": {
    "processedCount": 61,
    "createdCount": 61,
    "skippedCount": 0,
    "errorCount": 0,
    "errors": []
  }
}
```

### GET `/predicted-score/status`

Returns the current status of prediction records.

**Response:**
```json
{
  "message": "Prediction status",
  "totalRecords": 61,
  "readyForPrediction": 0,
  "alreadyPredicted": 61,
  "missingData": 0
}
```

### GET `/predicted-score/test-ml-connection`

Tests the connection to the ML API service.

**Response:**
```json
{
  "message": "ML API connection test",
  "isConnected": true
}
```

## Data Flow

1. **Input Validation**: Only processes `PredictionInputScore` records with non-null values for:
   - `weeklyStudyHours`
   - `attendancePercentage`
   - `partTimeHours`
   - `financialSupport`
   - `emotionalSupport`

2. **ML API Request**: Sends data in the format expected by the ML service:
   ```json
   {
     "semester_number": 1,
     "course_code": "CMU-CS 303",
     "study_format": "LEC",
     "credits_unit": 3,
     "weekly_study_hours": 25.0,
     "attendance_percentage": 85.0,
     "part_time_hours": 5.0,
     "financial_support": 2,
     "emotional_support": 2
   }
   ```

3. **ML API Response**: Receives prediction in the format:
   ```json
   {
     "mode": "raw_score_prediction",
     "predicted_score": 7.8543
   }
   ```

4. **Data Storage**: Creates record in `PredictedScore` with:
   - `userId`: From original input record
   - `inputScoreId`: Links to the `PredictionInputScore` record
   - `predictedScore`: Raw numeric prediction from ML (10.0 scale)
   - `PredictedconvertedNumericScore`: Converted to 4.0 scale GPA points
   - `PredictedconvertedScore`: Letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)

## Grade Conversion Scale

Chuyển đổi theo bảng điểm chuẩn chính thức:

**Thang điểm 10.0 → Letter Grade → Thang điểm 4.0:**
- **A+**: 9.5-10.0 → 4.0 (Giỏi)
- **A**: 8.5-9.4 → 4.0
- **A-**: 8.0-8.4 → 3.65 (Khá)
- **B+**: 7.5-7.9 → 3.33
- **B**: 7.0-7.4 → 3.0
- **B-**: 6.5-6.9 → 2.65 (Trung bình)
- **C+**: 6.0-6.4 → 2.33
- **C**: 5.5-5.9 → 2.0
- **C-**: 4.5-5.4 → 1.65 (Trung bình yếu)
- **D**: 4.0-4.4 → 1.0 (Không đạt)
- **F**: 0.0-3.9 → 0.0 (Kém)

## Error Handling

- **Connection Errors**: Logged and counted in error summary
- **Invalid Data**: Skipped with logging
- **Duplicate Prevention**: Records with existing predictions are automatically filtered out
- **Timeout**: 30-second timeout for ML API requests

## Dependencies

- **ML Service**: Must be running on `http://localhost:8000`
- **Database**: PostgreSQL with Prisma ORM
- **HTTP Client**: Axios for ML API communication

## Usage Example

```bash
# Check status first
Invoke-WebRequest -Uri "http://localhost:3000/predicted-score/status" -Method GET

# Test ML connection
Invoke-WebRequest -Uri "http://localhost:3000/predicted-score/test-ml-connection" -Method GET

# Run predictions
Invoke-WebRequest -Uri "http://localhost:3000/predicted-score/populate" -Method POST
```

## Integration with Other Modules

- **Requires**: `PredictionInputScore` records with complete data (use `PredictionScore` module to populate missing values)
- **Produces**: `PredictedScore` records that can be used by frontend applications
- **Links**: Each prediction is linked to its source `PredictionInputScore` record via `inputScoreId`
