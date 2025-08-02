import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyQuestionDto } from './dto/create-survey-question.dto';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';

@Controller('api/survey-questions')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // GET /api/survey-questions - Get all survey questions
  @Get()
  async getAllQuestions() {
    return this.surveyService.getAllQuestions();
  }

  // GET /api/survey-questions/active - Get only active questions
  @Get('active')
  async getActiveQuestions() {
    return this.surveyService.getActiveQuestions();
  }

  // GET /api/survey-questions/:id - Get a single question
  @Get(':id')
  async getQuestionById(@Param('id', ParseIntPipe) id: number) {
    const question = await this.surveyService.getQuestionById(id);
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  // POST /api/survey-questions - Create a new survey question
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createQuestion(@Body() createSurveyQuestionDto: CreateSurveyQuestionDto) {
    return this.surveyService.createQuestion(createSurveyQuestionDto);
  }

  // DELETE /api/survey-questions/:id - Delete a survey question
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.surveyService.deleteQuestion(id);
    } catch (error) {
      throw new NotFoundException('Question not found');
    }
  }

  // PATCH /api/survey-questions/:id/toggle - Toggle isActive status
  @Patch(':id/toggle')
  async toggleQuestionActive(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.surveyService.toggleQuestionActive(id);
    } catch (error) {
      throw new NotFoundException('Question not found');
    }
  }
}

// Controller riêng cho survey responses
@Controller('api/survey-responses')
export class SurveyResponseController {
  constructor(private readonly surveyService: SurveyService) {}

  // POST /api/survey-responses - Submit survey response
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async submitSurveyResponse(@Body() createSurveyResponseDto: CreateSurveyResponseDto) {
    try {
      return await this.surveyService.submitSurveyResponse(createSurveyResponseDto);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // GET /api/survey-responses/user/:userId - Get user survey history
  @Get('user/:userId')
  async getUserSurveyHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.surveyService.getUserSurveyHistory(userId);
  }

  // GET /api/survey-responses/user/:userId/check - Check if user has previous response
  @Get('user/:userId/check')
  async checkUserHasSurveyResponse(@Param('userId', ParseIntPipe) userId: number) {
    return this.surveyService.checkUserHasSurveyResponse(userId);
  }
}
