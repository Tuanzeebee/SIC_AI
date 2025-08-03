# PredictionScore Module

This module provides functionality to populate missing values in the `PredictionInputScore` table using median values calculated based on subject type classification.

## API Endpoint

### POST `/prediction-score/populate`

Populates missing values in PredictionInputScore records using median values based on course subject type.

**Request**: No body required

**Response**:
```json
{
  "message": "Successfully populated missing values",
  "updatedCount": 21,
  "totalCoursesProcessed": 62
}
```

## How It Works

1. **Subject Type Classification**: Each course is classified as either 'major' or 'general' based on the course code using a predefined mapping.

2. **Median Calculation**: For each subject type, the module calculates median values for:
   - `weeklyStudyHours`
   - `attendancePercentage`
   - `studyHoursXAttendance`
   - `studyHoursXPartTime`
   - `attendanceXEmotionalSupport`
   - `fullInteractionFeature`

3. **Missing Value Population**: Records with null/undefined values in any of the above fields are updated with the appropriate median values based on their subject type.

## Subject Type Mapping

The module uses a comprehensive mapping of course codes to subject types:

- **Major courses**: CMU-SE, CMU-CS, DTE-IS, IS-ENG, PHY 101, MTH 254, MTH 291, MTH 341, etc.
- **General courses**: CS 201, CHE 101, MTH 103, MTH 104, COM 141/142, HIS, PHI, POS, LAW, EVR, STA, etc.

## Usage Example

```bash
# Using PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/prediction-score/populate" -Method POST

# Using curl (in other shells)
curl -X POST http://localhost:3000/prediction-score/populate
```

## Dependencies

- NestJS framework
- Prisma ORM
- PostgreSQL database
- PredictionInputScore model must exist in the database schema
