import { Test, TestingModule } from '@nestjs/testing';

// Test class để kiểm tra logic chuyển đổi điểm
class GradeConverter {
  static convertTo4PointScale(score: number): number {
    // Convert 10.0 scale to 4.0 scale according to official grading standards
    // Giỏi: 9.5-10.0 → A+ → 4.0
    if (score >= 9.5) return 4.0;
    // 8.5-9.4 → A → 4.0
    if (score >= 8.5) return 4.0;
    // Khá: 8.0-8.4 → A- → 3.65
    if (score >= 8.0) return 3.65;
    // 7.5-7.9 → B+ → 3.33
    if (score >= 7.5) return 3.33;
    // 7.0-7.4 → B → 3.0
    if (score >= 7.0) return 3.0;
    // Trung bình: 6.5-6.9 → B- → 2.65
    if (score >= 6.5) return 2.65;
    // 6.0-6.4 → C+ → 2.33
    if (score >= 6.0) return 2.33;
    // 5.5-5.9 → C → 2.0
    if (score >= 5.5) return 2.0;
    // Trung bình yếu: 4.5-5.4 → C- → 1.65
    if (score >= 4.5) return 1.65;
    // Không đạt: 4.0-4.4 → D → 1.0
    if (score >= 4.0) return 1.0;
    // Kém: 0.0-3.9 → F → 0.0
    return 0.0;
  }

  static convertNumericToLetterGrade(score: number): string {
    // Convert numeric score to letter grade based on official grading standards
    // Giỏi: 9.5-10.0 → A+
    if (score >= 9.5) return 'A+';
    // 8.5-9.4 → A
    if (score >= 8.5) return 'A';
    // Khá: 8.0-8.4 → A-
    if (score >= 8.0) return 'A-';
    // 7.5-7.9 → B+
    if (score >= 7.5) return 'B+';
    // 7.0-7.4 → B
    if (score >= 7.0) return 'B';
    // Trung bình: 6.5-6.9 → B-
    if (score >= 6.5) return 'B-';
    // 6.0-6.4 → C+
    if (score >= 6.0) return 'C+';
    // 5.5-5.9 → C
    if (score >= 5.5) return 'C';
    // Trung bình yếu: 4.5-5.4 → C-
    if (score >= 4.5) return 'C-';
    // Không đạt: 4.0-4.4 → D
    if (score >= 4.0) return 'D';
    // Kém: 0.0-3.9 → F
    return 'F';
  }
}

describe('Grade Conversion Tests', () => {
  describe('convertTo4PointScale', () => {
    it('should convert 10.0 scale scores to correct 4.0 scale values', () => {
      // Test các boundary cases theo bảng điểm chuẩn
      
      // Giỏi - A+ (9.5-10.0 → 4.0)
      expect(GradeConverter.convertTo4PointScale(10.0)).toBe(4.0);
      expect(GradeConverter.convertTo4PointScale(9.7)).toBe(4.0);
      expect(GradeConverter.convertTo4PointScale(9.5)).toBe(4.0);
      
      // A (8.5-9.4 → 4.0)
      expect(GradeConverter.convertTo4PointScale(9.4)).toBe(4.0);
      expect(GradeConverter.convertTo4PointScale(9.0)).toBe(4.0);
      expect(GradeConverter.convertTo4PointScale(8.5)).toBe(4.0);
      
      // Khá - A- (8.0-8.4 → 3.65)
      expect(GradeConverter.convertTo4PointScale(8.4)).toBe(3.65);
      expect(GradeConverter.convertTo4PointScale(8.2)).toBe(3.65);
      expect(GradeConverter.convertTo4PointScale(8.0)).toBe(3.65);
      
      // B+ (7.5-7.9 → 3.33)
      expect(GradeConverter.convertTo4PointScale(7.9)).toBe(3.33);
      expect(GradeConverter.convertTo4PointScale(7.7)).toBe(3.33);
      expect(GradeConverter.convertTo4PointScale(7.5)).toBe(3.33);
      
      // B (7.0-7.4 → 3.0)
      expect(GradeConverter.convertTo4PointScale(7.4)).toBe(3.0);
      expect(GradeConverter.convertTo4PointScale(7.2)).toBe(3.0);
      expect(GradeConverter.convertTo4PointScale(7.0)).toBe(3.0);
      
      // Trung bình - B- (6.5-6.9 → 2.65)
      expect(GradeConverter.convertTo4PointScale(6.9)).toBe(2.65);
      expect(GradeConverter.convertTo4PointScale(6.7)).toBe(2.65);
      expect(GradeConverter.convertTo4PointScale(6.5)).toBe(2.65);
      
      // C+ (6.0-6.4 → 2.33)
      expect(GradeConverter.convertTo4PointScale(6.4)).toBe(2.33);
      expect(GradeConverter.convertTo4PointScale(6.2)).toBe(2.33);
      expect(GradeConverter.convertTo4PointScale(6.0)).toBe(2.33);
      
      // C (5.5-5.9 → 2.0)
      expect(GradeConverter.convertTo4PointScale(5.9)).toBe(2.0);
      expect(GradeConverter.convertTo4PointScale(5.7)).toBe(2.0);
      expect(GradeConverter.convertTo4PointScale(5.5)).toBe(2.0);
      
      // Trung bình yếu - C- (4.5-5.4 → 1.65)
      expect(GradeConverter.convertTo4PointScale(5.4)).toBe(1.65);
      expect(GradeConverter.convertTo4PointScale(5.0)).toBe(1.65);
      expect(GradeConverter.convertTo4PointScale(4.5)).toBe(1.65);
      
      // Không đạt - D (4.0-4.4 → 1.0)
      expect(GradeConverter.convertTo4PointScale(4.4)).toBe(1.0);
      expect(GradeConverter.convertTo4PointScale(4.2)).toBe(1.0);
      expect(GradeConverter.convertTo4PointScale(4.0)).toBe(1.0);
      
      // Kém - F (0.0-3.9 → 0.0)
      expect(GradeConverter.convertTo4PointScale(3.9)).toBe(0.0);
      expect(GradeConverter.convertTo4PointScale(2.0)).toBe(0.0);
      expect(GradeConverter.convertTo4PointScale(0.0)).toBe(0.0);
    });
  });

  describe('convertNumericToLetterGrade', () => {
    it('should convert 10.0 scale scores to correct letter grades', () => {
      // Test các boundary cases cho letter grades
      
      // A+ (9.5-10.0)
      expect(GradeConverter.convertNumericToLetterGrade(10.0)).toBe('A+');
      expect(GradeConverter.convertNumericToLetterGrade(9.7)).toBe('A+');
      expect(GradeConverter.convertNumericToLetterGrade(9.5)).toBe('A+');
      
      // A (8.5-9.4)
      expect(GradeConverter.convertNumericToLetterGrade(9.4)).toBe('A');
      expect(GradeConverter.convertNumericToLetterGrade(9.0)).toBe('A');
      expect(GradeConverter.convertNumericToLetterGrade(8.5)).toBe('A');
      
      // A- (8.0-8.4)
      expect(GradeConverter.convertNumericToLetterGrade(8.4)).toBe('A-');
      expect(GradeConverter.convertNumericToLetterGrade(8.2)).toBe('A-');
      expect(GradeConverter.convertNumericToLetterGrade(8.0)).toBe('A-');
      
      // B+ (7.5-7.9)
      expect(GradeConverter.convertNumericToLetterGrade(7.9)).toBe('B+');
      expect(GradeConverter.convertNumericToLetterGrade(7.7)).toBe('B+');
      expect(GradeConverter.convertNumericToLetterGrade(7.5)).toBe('B+');
      
      // B (7.0-7.4)
      expect(GradeConverter.convertNumericToLetterGrade(7.4)).toBe('B');
      expect(GradeConverter.convertNumericToLetterGrade(7.2)).toBe('B');
      expect(GradeConverter.convertNumericToLetterGrade(7.0)).toBe('B');
      
      // B- (6.5-6.9)
      expect(GradeConverter.convertNumericToLetterGrade(6.9)).toBe('B-');
      expect(GradeConverter.convertNumericToLetterGrade(6.7)).toBe('B-');
      expect(GradeConverter.convertNumericToLetterGrade(6.5)).toBe('B-');
      
      // C+ (6.0-6.4)
      expect(GradeConverter.convertNumericToLetterGrade(6.4)).toBe('C+');
      expect(GradeConverter.convertNumericToLetterGrade(6.2)).toBe('C+');
      expect(GradeConverter.convertNumericToLetterGrade(6.0)).toBe('C+');
      
      // C (5.5-5.9)
      expect(GradeConverter.convertNumericToLetterGrade(5.9)).toBe('C');
      expect(GradeConverter.convertNumericToLetterGrade(5.7)).toBe('C');
      expect(GradeConverter.convertNumericToLetterGrade(5.5)).toBe('C');
      
      // C- (4.5-5.4)
      expect(GradeConverter.convertNumericToLetterGrade(5.4)).toBe('C-');
      expect(GradeConverter.convertNumericToLetterGrade(5.0)).toBe('C-');
      expect(GradeConverter.convertNumericToLetterGrade(4.5)).toBe('C-');
      
      // D (4.0-4.4)
      expect(GradeConverter.convertNumericToLetterGrade(4.4)).toBe('D');
      expect(GradeConverter.convertNumericToLetterGrade(4.2)).toBe('D');
      expect(GradeConverter.convertNumericToLetterGrade(4.0)).toBe('D');
      
      // F (0.0-3.9)
      expect(GradeConverter.convertNumericToLetterGrade(3.9)).toBe('F');
      expect(GradeConverter.convertNumericToLetterGrade(2.0)).toBe('F');
      expect(GradeConverter.convertNumericToLetterGrade(0.0)).toBe('F');
    });
  });

  describe('Integration Test', () => {
    it('should maintain consistency between letter grade and 4.0 scale conversion', () => {
      const testCases = [
        { score: 10.0, expectedLetter: 'A+', expectedGPA: 4.0, rank: 'Giỏi' },
        { score: 9.0, expectedLetter: 'A', expectedGPA: 4.0, rank: 'Giỏi' },
        { score: 8.2, expectedLetter: 'A-', expectedGPA: 3.65, rank: 'Khá' },
        { score: 7.7, expectedLetter: 'B+', expectedGPA: 3.33, rank: 'Khá' },
        { score: 7.2, expectedLetter: 'B', expectedGPA: 3.0, rank: 'Trung bình' },
        { score: 6.7, expectedLetter: 'B-', expectedGPA: 2.65, rank: 'Trung bình' },
        { score: 6.2, expectedLetter: 'C+', expectedGPA: 2.33, rank: 'Trung bình' },
        { score: 5.7, expectedLetter: 'C', expectedGPA: 2.0, rank: 'Trung bình' },
        { score: 5.0, expectedLetter: 'C-', expectedGPA: 1.65, rank: 'Trung bình yếu' },
        { score: 4.2, expectedLetter: 'D', expectedGPA: 1.0, rank: 'Không đạt' },
        { score: 2.0, expectedLetter: 'F', expectedGPA: 0.0, rank: 'Kém' }
      ];

      testCases.forEach(testCase => {
        const letterGrade = GradeConverter.convertNumericToLetterGrade(testCase.score);
        const gpaScore = GradeConverter.convertTo4PointScale(testCase.score);
        
        expect(letterGrade).toBe(testCase.expectedLetter);
        expect(gpaScore).toBe(testCase.expectedGPA);
        
        console.log(`Score ${testCase.score} → ${letterGrade} → ${gpaScore} (${testCase.rank})`);
      });
    });
  });
});
