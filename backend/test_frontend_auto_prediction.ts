import axios from 'axios';

// Test tính năng mới: Auto prediction khi ấn "Xác nhận" trong TutorialPrediction
async function testFrontendAutoPrediction() {
  console.log('🧪 Testing Frontend Auto Prediction Feature');
  console.log('============================================\n');
  
  const BASE_URL = 'http://localhost:3000';
  const USER_ID = 1;
  
  try {
    console.log('🎯 Test: Endpoint mới updatePartTimeHoursWithAutoPrediction...\n');
    
    // Test endpoint mới mà frontend sẽ gọi khi user ấn "Xác nhận"
    const response = await axios.post(
      `${BASE_URL}/api/part-time-hour-saves/update-part-time-hours-with-smart-prediction`,
      {
        userId: USER_ID,
        partTimeHours: 30, // Người dùng nhập 30 giờ/tuần
        viewMode: 'semester'
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 60 seconds timeout
      }
    );
    
    console.log('✅ Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
    // Kiểm tra có prediction results không
    if (response.data.success && response.data.data?.predictionResult?.data?.length > 0) {
      const predictionCount = response.data.data.predictionResult.data.length;
      console.log(`\n🎉 SUCCESS: Tự động dự đoán ${predictionCount} môn học!`);
      
      console.log('\n📈 Sample Prediction Results:');
      response.data.data.predictionResult.data.slice(0, 3).forEach((result: any, index: number) => {
        console.log(`  ${index + 1}. ${result.courseCode}`);
        if (result.success && result.predictions) {
          console.log(`     📚 Weekly Study Hours: ${result.predictions.predicted_weekly_study_hours?.toFixed(1)}`);
          console.log(`     🎯 Attendance %: ${result.predictions.predicted_attendance_percentage?.toFixed(1)}%`);
        }
      });
      
      console.log('\n✅ Frontend sẽ hiển thị:');
      console.log(`   - Success toast: "Đã tải và lưu dữ liệu theo kỳ thành công và tự động dự đoán ${predictionCount} môn học"`);
      console.log(`   - Prediction results component với ${predictionCount} records`);
      console.log('   - Real-time updates trong UI');
      
    } else {
      console.log('\n⚠️  No predictions were made - this might be expected if:');
      console.log('   - No records have rawScore > 0');
      console.log('   - All eligible records already have predictions');
      console.log('   - Missing survey data (financialSupport/emotionalSupport)');
    }
    
    console.log('\n🔗 User Experience Flow:');
    console.log('1. User nhập part-time hours trong frontend');
    console.log('2. User click "Xác nhận" button');
    console.log('3. Frontend gọi updatePartTimeHoursWithAutoPrediction API');
    console.log('4. Backend tự động:');
    console.log('   - Update part-time hours cho tất cả records');
    console.log('   - Trigger auto prediction cho records có rawScore > 0');
    console.log('   - Return cả update results VÀ prediction results');
    console.log('5. Frontend hiển thị:');
    console.log('   - Success message với số lượng predictions');
    console.log('   - Prediction results component');
    console.log('   - Updated academic statistics');
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Kiểm tra endpoint có hoạt động không
async function checkEndpointAvailability() {
  console.log('🔍 Checking endpoint availability...\n');
  
  try {
    const response = await axios.get('http://localhost:3000');
    console.log('✅ Backend is running');
    
    const mlResponse = await axios.get('http://localhost:8000');
    console.log('✅ ML Service is running');
    
    console.log('✅ All services are ready for testing\n');
    return true;
  } catch (error) {
    console.error('❌ Some services are not running');
    return false;
  }
}

// Main execution
async function main() {
  const isReady = await checkEndpointAvailability();
  
  if (isReady) {
    await testFrontendAutoPrediction();
  } else {
    console.log('Please start backend and ML service first');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { testFrontendAutoPrediction };
