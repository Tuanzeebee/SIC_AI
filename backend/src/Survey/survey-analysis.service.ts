import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import axios from "axios";

@Injectable()
export class SurveyAnalysisService {
  constructor(private prisma: PrismaService) {}

  async analyzeSurvey(userId: number) {
    try {
      // Lấy survey responses gần nhất của user
      const latestResponse = await this.prisma.surveyResponse.findFirst({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        include: {
          answers: {
            include: {
              question: true
            }
          }
        }
      });

      if (!latestResponse || !latestResponse.answers.length) {
        throw new Error('Không tìm thấy kết quả khảo sát cho user này');
      }

      // Kiểm tra xem đã có phân tích cho user này chưa
      const existingAnalysis = await this.prisma.surveyAnalysisResult.findUnique({
        where: { userId }
      });

      // Nếu đã có phân tích và survey response mới nhất không mới hơn phân tích, trả về kết quả cũ
      if (existingAnalysis && latestResponse.submittedAt <= existingAnalysis.createdAt) {
        return existingAnalysis;
      }

      const formattedText = latestResponse.answers
        .map(
          (a, i) =>
            `Câu ${i + 1} (${a.question.category}): ${a.question.text}\n→ Trả lời: ${a.selectedOption}`
        )
        .join('\n\n');

      const prompt = `
Bạn là một hệ thống phân tích dữ liệu khảo sát. Dưới đây là câu hỏi và câu trả lời của sinh viên:

${formattedText}

Dựa trên các câu trả lời, hãy đánh giá mức độ hỗ trợ của sinh viên theo hai tiêu chí:
1. Hỗ trợ TINH THẦN (EMOTIONAL)
2. Hỗ trợ TÀI CHÍNH (FINANCIAL)

Với mỗi tiêu chí, trả về 1 con số duy nhất trong khoảng:
- 0: Thấp
- 1: Trung bình
- 2: Cao
- 3: Rất cao

Chỉ trả JSON kết quả như sau (không có text khác):
{
  "emotional": X,
  "financial": Y
}
      `.trim();

      const geminiApiKey = process.env.GEMINI_API_KEY;
    //   console.log('DEBUG: GEMINI_API_KEY length:', geminiApiKey ? geminiApiKey.length : 'undefined');
    //   console.log('DEBUG: GEMINI_API_KEY first 10 chars:', geminiApiKey ? geminiApiKey.substring(0, 10) : 'undefined');
      
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY chưa được cấu hình trong environment variables');
      }

      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const content =
        geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
      
      //console.log('Gemini response content:', content);

      // Làm sạch content để lấy JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;

      let parsed;
      try {
        parsed = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Error parsing Gemini response:', content);
        // Fallback values nếu không parse được
        parsed = { emotional: 1, financial: 1 };
      }

      // Validate parsed values
      const emotionalLevel = Math.max(0, Math.min(3, parseInt(parsed.emotional) || 1));
      const financialLevel = Math.max(0, Math.min(3, parseInt(parsed.financial) || 1));

      // Sử dụng upsert để tránh unique constraint violation
      const analysisResult = await this.prisma.surveyAnalysisResult.upsert({
        where: { userId },
        update: {
          emotionalLevel,
          financialLevel,
          updatedAt: new Date()
        },
        create: {
          userId,
          emotionalLevel,
          financialLevel,
        },
      });

      return analysisResult;
    } catch (error) {
      console.error('Error in analyzeSurvey:', error);
      throw new Error(`Lỗi khi phân tích khảo sát: ${error.message}`);
    }
  }

  // Method để lấy kết quả phân tích mới nhất của user
  async getLatestAnalysis(userId: number) {
    return this.prisma.surveyAnalysisResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Method để lấy tất cả lịch sử phân tích của user
  async getAnalysisHistory(userId: number) {
    return this.prisma.surveyAnalysisResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Debug method để kiểm tra tất cả dữ liệu SurveyAnalysisResult
  async getAllAnalysisResults() {
    return this.prisma.surveyAnalysisResult.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
