import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { CreateSurveyQuestionDto } from './dto/create-survey-question.dto';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';

@Injectable()
export class SurveyService {
  constructor(private prisma: PrismaService) {}

  // Get all survey questions
  async getAllQuestions() {
    return this.prisma.surveyQuestion.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Create a new survey question
  async createQuestion(createSurveyQuestionDto: CreateSurveyQuestionDto) {
    return this.prisma.surveyQuestion.create({
      data: {
        text: createSurveyQuestionDto.text,
        category: createSurveyQuestionDto.category,
        options: createSurveyQuestionDto.options,
        allowMultiple: createSurveyQuestionDto.allowMultiple || false, // Default false
      },
    });
  }

  // Delete a survey question by ID
  async deleteQuestion(id: number) {
    // First, delete related survey answers
    await this.prisma.surveyAnswer.deleteMany({
      where: {
        questionId: id,
      },
    });

    // Then delete the question
    return this.prisma.surveyQuestion.delete({
      where: {
        id: id,
      },
    });
  }

  // Toggle the isActive status of a survey question
  async toggleQuestionActive(id: number) {
    const question = await this.prisma.surveyQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    return this.prisma.surveyQuestion.update({
      where: { id },
      data: {
        isActive: !question.isActive,
      },
    });
  }

  // Get a single question by ID
  async getQuestionById(id: number) {
    return this.prisma.surveyQuestion.findUnique({
      where: { id },
    });
  }

  // Get only active questions (for frontend survey display)
  async getActiveQuestions() {
    return this.prisma.surveyQuestion.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Submit survey response (lưu câu trả lời của người dùng)
  async submitSurveyResponse(createSurveyResponseDto: CreateSurveyResponseDto) {
    const { userId, responses } = createSurveyResponseDto;

    try {
      // Kiểm tra xem user đã có survey response nào chưa
      const existingResponses = await this.prisma.surveyResponse.findMany({
        where: {
          userId: userId,
        },
        include: {
          answers: true,
        },
      });

      // Nếu có survey response cũ, xóa tất cả để ghi đè
      if (existingResponses.length > 0) {
        for (const existingResponse of existingResponses) {
          // Xóa tất cả answers của response này
          await this.prisma.surveyAnswer.deleteMany({
            where: {
              responseId: existingResponse.id,
            },
          });
          
          // Xóa response
          await this.prisma.surveyResponse.delete({
            where: {
              id: existingResponse.id,
            },
          });
        }
      }

      // Tạo SurveyResponse mới
      const surveyResponse = await this.prisma.surveyResponse.create({
        data: {
          userId: userId,
        },
      });

      // Tạo tất cả SurveyAnswer cho phiên khảo sát này
      const surveyAnswers = await Promise.all(
        responses.map(response => {
          // Xử lý answer: nếu là array thì join bằng separator, nếu là string thì giữ nguyên
          let selectedOption: string;
          if (Array.isArray(response.answer)) {
            selectedOption = response.answer.join('|'); // Sử dụng | làm separator
          } else {
            selectedOption = response.answer || '';
          }
          
          return this.prisma.surveyAnswer.create({
            data: {
              responseId: surveyResponse.id,
              questionId: response.questionId,
              selectedOption: selectedOption,
            },
          });
        })
      );

      // Trả về kết quả với đầy đủ thông tin
      return {
        surveyResponse,
        answers: surveyAnswers,
        message: existingResponses.length > 0 
          ? 'Khảo sát đã được cập nhật thành công!' 
          : 'Khảo sát đã được lưu thành công!',
        isOverwrite: existingResponses.length > 0,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lưu khảo sát: ${error.message}`);
    }
  }

  // Lấy lịch sử khảo sát của một user
  async getUserSurveyHistory(userId: number) {
    return this.prisma.surveyResponse.findMany({
      where: {
        userId: userId,
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  // Kiểm tra xem user đã có survey response nào chưa
  async checkUserHasSurveyResponse(userId: number) {
    const responseCount = await this.prisma.surveyResponse.count({
      where: {
        userId: userId,
      },
    });
    
    return {
      hasPreviousResponse: responseCount > 0,
      responseCount: responseCount,
    };
  }
}
