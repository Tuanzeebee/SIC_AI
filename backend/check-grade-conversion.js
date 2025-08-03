// Simple test script để kiểm tra logic chuyển đổi điểm
// Chạy với: node check-grade-conversion.js

class GradeConverter {
  static convertTo4PointScale(score) {
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

  static convertNumericToLetterGrade(score) {
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

console.log('=== KIỂM TRA LOGIC CHUYỂN ĐỔI ĐIỂM ===\n');

const testCases = [
  { score: 10.0, expectedLetter: 'A+', expectedGPA: 4.0, rank: 'Giỏi' },
  { score: 9.5, expectedLetter: 'A+', expectedGPA: 4.0, rank: 'Giỏi' },
  { score: 9.4, expectedLetter: 'A', expectedGPA: 4.0, rank: 'Giỏi' },
  { score: 8.5, expectedLetter: 'A', expectedGPA: 4.0, rank: 'Giỏi' },
  { score: 8.4, expectedLetter: 'A-', expectedGPA: 3.65, rank: 'Khá' },
  { score: 8.0, expectedLetter: 'A-', expectedGPA: 3.65, rank: 'Khá' },
  { score: 7.9, expectedLetter: 'B+', expectedGPA: 3.33, rank: 'Khá' },
  { score: 7.5, expectedLetter: 'B+', expectedGPA: 3.33, rank: 'Khá' },
  { score: 7.4, expectedLetter: 'B', expectedGPA: 3.0, rank: 'Trung bình' },
  { score: 7.0, expectedLetter: 'B', expectedGPA: 3.0, rank: 'Trung bình' },
  { score: 6.9, expectedLetter: 'B-', expectedGPA: 2.65, rank: 'Trung bình' },
  { score: 6.5, expectedLetter: 'B-', expectedGPA: 2.65, rank: 'Trung bình' },
  { score: 6.4, expectedLetter: 'C+', expectedGPA: 2.33, rank: 'Trung bình' },
  { score: 6.0, expectedLetter: 'C+', expectedGPA: 2.33, rank: 'Trung bình' },
  { score: 5.9, expectedLetter: 'C', expectedGPA: 2.0, rank: 'Trung bình' },
  { score: 5.5, expectedLetter: 'C', expectedGPA: 2.0, rank: 'Trung bình' },
  { score: 5.4, expectedLetter: 'C-', expectedGPA: 1.65, rank: 'Trung bình yếu' },
  { score: 4.5, expectedLetter: 'C-', expectedGPA: 1.65, rank: 'Trung bình yếu' },
  { score: 4.4, expectedLetter: 'D', expectedGPA: 1.0, rank: 'Không đạt' },
  { score: 4.0, expectedLetter: 'D', expectedGPA: 1.0, rank: 'Không đạt' },
  { score: 3.9, expectedLetter: 'F', expectedGPA: 0.0, rank: 'Kém' },
  { score: 2.0, expectedLetter: 'F', expectedGPA: 0.0, rank: 'Kém' },
  { score: 0.0, expectedLetter: 'F', expectedGPA: 0.0, rank: 'Kém' }
];

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  const letterGrade = GradeConverter.convertNumericToLetterGrade(testCase.score);
  const gpaScore = GradeConverter.convertTo4PointScale(testCase.score);
  
  const letterMatch = letterGrade === testCase.expectedLetter;
  const gpaMatch = gpaScore === testCase.expectedGPA;
  
  const status = (letterMatch && gpaMatch) ? '✅ PASS' : '❌ FAIL';
  
  if (letterMatch && gpaMatch) {
    passCount++;
  } else {
    failCount++;
  }
  
  console.log(`${status} | Điểm: ${testCase.score.toString().padEnd(4)} | Letter: ${letterGrade.padEnd(2)} (expected ${testCase.expectedLetter.padEnd(2)}) | GPA: ${gpaScore.toString().padEnd(4)} (expected ${testCase.expectedGPA.toString().padEnd(4)}) | ${testCase.rank}`);
});

console.log('\n=== KẾT QUẢ KIỂM TRA ===');
console.log(`✅ PASS: ${passCount} test cases`);
console.log(`❌ FAIL: ${failCount} test cases`);
console.log(`📊 Success Rate: ${((passCount / testCases.length) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log('\n🎉 TẤT CẢ LOGIC CHUYỂN ĐỔI ĐIỂM ĐỀU CHÍNH XÁC!');
  console.log('✨ Hệ thống đã sẵn sàng để chuyển đổi PredictedconvertedNumericScore sang thang điểm 4.0');
} else {
  console.log('\n⚠️  CẦN KIỂM TRA VÀ SỬA LỖI LOGIC CHUYỂN ĐỔI');
}
