# Calculator Credit API Documentation

## Overview

The Calculator Credit module provides comprehensive APIs for calculating academic statistics including earned credits, progress percentage, GPA, and academic rankings based on student score records.

## API Endpoints

### Base URL: `/api/calculator-credit`

---

### 1. Academic Statistics (Comprehensive)
**GET** `/academic-statistics/:userId`

Returns comprehensive academic statistics for a user.

**Response:**
```json
{
  "success": true,
  "message": "Lấy thống kê học tập thành công",
  "data": {
    "totalProgramCredits": 144,
    "earnedCredits": 85,
    "progressPercentage": 59.0,
    "gpa": 3.15,
    "academicRank": "Giỏi",
    "totalCourses": 28,
    "validCourses": 25,
    "excludedCourses": 3,
    "excludedCourseCodes": ["ES101 (ES Course)", "MATH201 (No Score)"],
    "summary": {
      "completedCredits": 85,
      "remainingCredits": 59,
      "completionRate": "59.0%"
    }
  }
}
```

---

### 2. Quick Statistics (Dashboard)
**GET** `/quick-statistics/:userId`

Returns essential statistics for dashboard display.

**Response:**
```json
{
  "success": true,
  "message": "Lấy thống kê nhanh thành công",
  "data": {
    "earnedCredits": 85,
    "progressPercentage": 59.0,
    "gpa": 3.15,
    "academicRank": "Giỏi"
  }
}
```

---

### 3. Course Details
**GET** `/course-details/:userId`

Returns detailed information about all courses with exclusion reasons.

**Response:**
```json
{
  "success": true,
  "message": "Lấy chi tiết môn học thành công",
  "data": [
    {
      "courseCode": "MATH101",
      "courseName": "Toán cao cấp 1",
      "credits": 3,
      "rawScore": 8.5,
      "convertedScore": "B+",
      "semester": "HK1",
      "year": "2024",
      "isExcluded": false
    },
    {
      "courseCode": "ES101",
      "courseName": "English Skills",
      "credits": 2,
      "rawScore": 7.0,
      "convertedScore": "B",
      "semester": "HK1",
      "year": "2024",
      "isExcluded": true,
      "exclusionReason": "Môn học ES (không tính tín chỉ)"
    }
  ],
  "count": 28
}
```

---

### 4. Semester Statistics
**GET** `/semester-statistics/:userId`

Returns statistics grouped by semester.

**Response:**
```json
{
  "success": true,
  "message": "Lấy thống kê theo học kỳ thành công",
  "data": [
    {
      "semester": "2024-HK1",
      "totalCourses": 8,
      "validCourses": 7,
      "excludedCourses": 1,
      "earnedCredits": 21,
      "gpa": 3.2,
      "academicRank": "Giỏi"
    },
    {
      "semester": "2024-HKHè",
      "totalCourses": 3,
      "validCourses": 3,
      "excludedCourses": 0,
      "earnedCredits": 9,
      "gpa": 3.0,
      "academicRank": "Khá"
    }
  ],
  "count": 4
}
```

---

### 5. Earned Credits Only
**GET** `/earned-credits/:userId`

Returns only earned credits information.

**Response:**
```json
{
  "success": true,
  "message": "Lấy tín chỉ đã học thành công",
  "data": {
    "earnedCredits": 85,
    "totalProgramCredits": 144
  }
}
```

---

### 6. Progress Percentage Only
**GET** `/progress/:userId`

Returns only progress information.

**Response:**
```json
{
  "success": true,
  "message": "Lấy tiến độ học tập thành công",
  "data": {
    "progressPercentage": 59.0,
    "earnedCredits": 85,
    "totalProgramCredits": 144,
    "remainingCredits": 59
  }
}
```

---

## Business Logic

### Exclusion Rules
The system excludes certain courses from credit calculations:
1. **Courses without scores**: Records where `rawScore` is `null` or `undefined`
2. **ES Courses**: Course codes starting with "ES" (English Skills, etc.)

### Academic Ranking System
Based on Vietnamese university standards:
- **Xuất sắc (Excellent)**: GPA ≥ 3.6
- **Giỏi (Good)**: GPA ≥ 3.2
- **Khá (Fair)**: GPA ≥ 2.5
- **Trung bình (Average)**: GPA ≥ 2.0
- **Yếu (Weak)**: GPA < 2.0

### Calculations
- **Earned Credits**: Sum of `creditsUnit` for valid courses
- **Progress Percentage**: `(earnedCredits / 144) * 100` (rounded to 1 decimal)
- **GPA**: `Σ(rawScore × creditsUnit) / Σ(creditsUnit)` (rounded to 2 decimals)

---

## Frontend Integration

### Import the API
```typescript
import { calculatorCreditApi } from '../services/api';
```

### Usage Examples
```typescript
// Get quick statistics for dashboard
const userId = 1;
const quickStats = await calculatorCreditApi.getQuickStatistics(userId);

// Get comprehensive academic statistics
const academicStats = await calculatorCreditApi.getAcademicStatistics(userId);

// Get earned credits only
const credits = await calculatorCreditApi.getEarnedCredits(userId);

// Get progress percentage
const progress = await calculatorCreditApi.getProgress(userId);
```

---

## Error Handling

All endpoints return a consistent error format:
```json
{
  "success": false,
  "message": "Error description in Vietnamese",
  "error": "Technical error details"
}
```

Common error scenarios:
- Invalid user ID (not found)
- Database connection issues
- No score records found for user

---

## File Structure

```
backend/src/CalculatorCredit/
├── dto/
│   └── academic-statistics.dto.ts    # Type definitions
├── calculator-credit.controller.ts   # API endpoints
├── calculator-credit.service.ts      # Business logic
└── calculator-credit.module.ts       # Module configuration

frontend/src/services/
└── calculatorCreditApi.ts           # Frontend API client
```

---

## Integration Notes

1. **Automatic Updates**: The frontend automatically refreshes academic statistics when:
   - CSV files are uploaded
   - Score data is updated
   - Component mounts

2. **Fallback Values**: The UI displays default values (0, "Chưa có dữ liệu") when API data is not available

3. **Real-time Calculations**: All calculations are performed server-side for consistency and accuracy

4. **Performance**: The quick statistics endpoint is optimized for dashboard use with minimal data transfer
