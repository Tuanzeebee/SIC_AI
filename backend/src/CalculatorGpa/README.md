# Calculator GPA Module

## Mô tả
Module này cung cấp các API để tính toán GPA (Grade Point Average) dựa trên dữ liệu điểm số trong bảng `ScoreRecord`.

## Công thức tính GPA
```
GPA = Tổng(convertedNumericScore * creditsUnit) / Tổng(creditsUnit)
```

**Lưu ý quan trọng**: 
- Chỉ tính các môn có `convertedNumericScore` khác null
- **Loại trừ** các môn có mã bắt đầu bằng "ES" (English Skills)

## API Endpoints

### 1. GET `/api/calculator-gpa/cumulative`
Tính GPA tích lũy (tất cả các kỳ)

**Query Parameters:**
- `userId` (required): ID của user

**Response:**
```json
{
  "success": true,
  "data": {
    "gpa": 3.25,
    "totalCredits": 120,
    "totalWeightedScore": 390,
    "recordsCount": 40
  },
  "message": "GPA tích lũy được tính thành công"
}
```

### 2. GET `/api/calculator-gpa/semester`
Tính GPA cho một kỳ học cụ thể

**Query Parameters:**
- `userId` (required): ID của user
- `year` (required): Năm học (ví dụ: "2023-2024")
- `semesterNumber` (required): Số kỳ (1, 2, hoặc 3)

**Response:**
```json
{
  "success": true,
  "data": {
    "gpa": 3.50,
    "totalCredits": 18,
    "totalWeightedScore": 63,
    "recordsCount": 6,
    "year": "2023-2024",
    "semesterNumber": 1
  },
  "message": "GPA kỳ 1 năm 2023-2024 được tính thành công"
}
```

### 3. GET `/api/calculator-gpa/detailed`
Tính GPA với thông tin chi tiết từng môn học

**Query Parameters:**
- `userId` (required): ID của user
- `year` (optional): Năm học
- `semesterNumber` (optional): Số kỳ

**Response:**
```json
{
  "success": true,
  "data": {
    "gpa": 3.25,
    "totalCredits": 120,
    "totalWeightedScore": 390,
    "recordsCount": 40,
    "details": [
      {
        "courseCode": "IT001",
        "courseName": "Lập trình căn bản",
        "convertedNumericScore": 3.5,
        "creditsUnit": 3,
        "weightedScore": 10.5,
        "year": "2023-2024",
        "semesterNumber": 1
      }
    ]
  },
  "message": "GPA chi tiết được tính thành công"
}
```

### 4. GET `/api/calculator-gpa/all-semesters`
Lấy GPA của tất cả các kỳ

**Query Parameters:**
- `userId` (required): ID của user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "gpa": 3.50,
      "totalCredits": 18,
      "totalWeightedScore": 63,
      "recordsCount": 6,
      "year": "2023-2024",
      "semesterNumber": 2
    },
    {
      "gpa": 3.25,
      "totalCredits": 15,
      "totalWeightedScore": 48.75,
      "recordsCount": 5,
      "year": "2023-2024",
      "semesterNumber": 1
    }
  ],
  "message": "GPA tất cả các kỳ được tính thành công"
}
```

### 5. GET `/api/calculator-gpa/quick-stats`
Lấy thống kê GPA nhanh

**Query Parameters:**
- `userId` (required): ID của user

**Response:**
```json
{
  "success": true,
  "data": {
    "cumulativeGpa": 3.25,
    "totalCredits": 120,
    "recordsCount": 40,
    "latestSemesterGpa": 3.50,
    "latestSemesterInfo": "HK2-2023-2024"
  },
  "message": "Thống kê GPA nhanh được tính thành công"
}
```

## Lưu ý

1. **Dữ liệu hợp lệ**: Chỉ các bản ghi có `convertedNumericScore` khác null mới được tính vào GPA.

2. **Loại trừ môn ES**: Các môn có mã bắt đầu bằng "ES" (English Skills) sẽ được loại trừ khỏi tính toán GPA.

3. **Làm tròn**: GPA được làm tròn đến 2 chữ số thập phân.

4. **Sắp xếp**: Kết quả được sắp xếp theo năm và kỳ học (mới nhất trước).

5. **Error handling**: Tất cả các API đều có xử lý lỗi và trả về thông báo phù hợp.

## Cách sử dụng

1. Import module trong `app.module.ts`:
```typescript
import { CalculatorGpaModule } from './CalculatorGpa/calculator-gpa.module';

@Module({
  imports: [
    // ... other modules
    CalculatorGpaModule,
  ],
})
export class AppModule {}
```

2. Sử dụng service trong controller khác:
```typescript
import { CalculatorGpaService } from '../CalculatorGpa/calculator-gpa.service';

@Controller()
export class SomeController {
  constructor(
    private readonly calculatorGpaService: CalculatorGpaService,
  ) {}

  async someMethod(userId: number) {
    const gpa = await this.calculatorGpaService.getCumulativeGpa(userId);
    return gpa;
  }
}
```
