# Survey Integration Update

## Overview
This update integrates the Survey Analysis results with the CSV upload functionality to automatically populate emotional and financial support values.

## Changes Made

### Modified: `backend/src/ScoreRecord/score-record.service.ts`

#### Before
The CSV upload process read `financialSupport` and `emotionalSupport` values directly from the CSV file columns.

#### After
The CSV upload process now:
1. **Retrieves the latest survey analysis** for the user from `SurveyAnalysisResult` table
2. **Extracts emotional and financial support levels** from the survey analysis
3. **Uses these values** to populate `emotionalSupport` and `financialSupport` fields in both:
   - `PredictionInputReverse` table
   - `PredictionInputScore` table

## Implementation Details

### Survey Analysis Retrieval
```typescript
// Retrieve the latest survey analysis result for the user
const latestSurveyAnalysis = await this.prisma.surveyAnalysisResult.findFirst({
  where: { userId },
  orderBy: { createdAt: 'desc' }
});

// Extract emotional and financial support levels (default to null if no survey analysis found)
const surveyEmotionalSupport = latestSurveyAnalysis?.emotionalLevel ?? null;
const surveyFinancialSupport = latestSurveyAnalysis?.financialLevel ?? null;
```

### Updated Field Assignment
Instead of reading from CSV:
```typescript
// OLD CODE (removed):
// const financialValue = row.financialSupport || row['financial_support'];
// const validFinancial = (parsedFinancial !== null && !isNaN(parsedFinancial)) ? parsedFinancial : null;

// NEW CODE:
const validFinancial = surveyFinancialSupport;
const validEmotional = surveyEmotionalSupport;
```

### Enhanced Response Message
The success message now includes information about the survey data usage:
```
"Đã ghi đè thành công X ScoreRecord, Y PredictionInputReverse, và Z PredictionInputScore từ N dòng dữ liệu CSV (dữ liệu cũ đã được xóa). Sử dụng mức hỗ trợ từ khảo sát: Tinh thần=2, Tài chính=1"
```

## Data Flow

1. **User uploads CSV file** via `/api/score-records/upload-csv/:userId`
2. **System queries SurveyAnalysisResult** for the latest analysis of that user
3. **Emotional and financial support values** are extracted from survey analysis
4. **For each course in CSV**, the system creates/updates:
   - `ScoreRecord` (from CSV data)
   - `PredictionInputReverse` (CSV data + survey emotional/financial support)
   - `PredictionInputScore` (CSV data + survey emotional/financial support)

## Fallback Behavior

- If **no survey analysis exists** for the user, the fields will be set to `null`
- The system gracefully handles missing survey data without failing
- Success message indicates when survey data is missing

## Database Impact

### Fields Affected
- `PredictionInputReverse.emotionalSupport` → Set to `SurveyAnalysisResult.emotionalLevel`
- `PredictionInputReverse.financialSupport` → Set to `SurveyAnalysisResult.financialLevel`
- `PredictionInputScore.emotionalSupport` → Set to `SurveyAnalysisResult.emotionalLevel`
- `PredictionInputScore.financialSupport` → Set to `SurveyAnalysisResult.financialLevel`

### Value Ranges
- **Emotional Support**: 0-3 (0=Thấp, 1=Trung bình, 2=Cao, 3=Rất cao)
- **Financial Support**: 0-3 (0=Thấp, 1=Trung bình, 2=Cao, 3=Rất cao)

## Testing

### Prerequisites
1. User must have completed a survey (creates `SurveyResponse`)
2. Survey must be analyzed (creates `SurveyAnalysisResult`)
3. CSV file with course data ready for upload

### Test Steps
1. **Complete survey** for a user
2. **Analyze survey** using `/api/survey-analysis/:userId` endpoint
3. **Upload CSV** using `/api/score-records/upload-csv/:userId` endpoint
4. **Verify** that `PredictionInputReverse` and `PredictionInputScore` records have correct emotional/financial support values

### Expected Results
- Emotional and financial support values match the latest survey analysis
- Success message includes survey data information
- All interaction features are calculated correctly using survey values

## Backward Compatibility

- **CSV files no longer need** `financial_support` and `emotional_support` columns
- **Existing functionality** remains unchanged for other CSV fields
- **Migration** is seamless - old data is replaced when new CSV is uploaded

## Related Endpoints

- **Survey Analysis**: `/api/survey-analysis/:userId/latest` - Get latest analysis
- **CSV Upload**: `/api/score-records/upload-csv/:userId` - Upload with survey integration
- **Prediction Data**: 
  - `/api/score-records/prediction-reverse/user/:userId`
  - `/api/score-records/prediction-score/user/:userId`
