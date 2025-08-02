const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMultipleChoiceQuestion() {
  try {
    const question = await prisma.surveyQuestion.create({
      data: {
        text: "Bạn thường nhận được hỗ trợ tinh thần từ gia đình qua những hình thức nào? (Có thể chọn nhiều)",
        category: "EMOTIONAL",
        options: [
          "Chia sẻ tâm sự, lắng nghe",
          "Động viên khi gặp khó khăn",
          "Tạo không gian học tập thoải mái",
          "Hỗ trợ khi stress, căng thẳng"
        ],
        isActive: true,
        allowMultiple: true
      }
    });
    
    console.log('Đã tạo câu hỏi multiple choice:', question);
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMultipleChoiceQuestion();
