import { Test, TestingModule } from '@nestjs/testing';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { PrismaService } from '../PrismaService/prisma.service';
import { CreateSurveyQuestionDto, QuestionCategory } from './dto/create-survey-question.dto';

describe('SurveyController', () => {
  let controller: SurveyController;
  let service: SurveyService;

  const mockSurveyService = {
    getAllQuestions: jest.fn(),
    getActiveQuestions: jest.fn(),
    getQuestionById: jest.fn(),
    createQuestion: jest.fn(),
    deleteQuestion: jest.fn(),
    toggleQuestionActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyController],
      providers: [
        {
          provide: SurveyService,
          useValue: mockSurveyService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SurveyController>(SurveyController);
    service = module.get<SurveyService>(SurveyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllQuestions', () => {
    it('should return an array of questions', async () => {
      const result = [
        {
          id: 1,
          text: 'Test question',
          category: QuestionCategory.GENERAL,
          options: ['Option 1', 'Option 2'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockSurveyService.getAllQuestions.mockResolvedValue(result);

      expect(await controller.getAllQuestions()).toBe(result);
      expect(service.getAllQuestions).toHaveBeenCalled();
    });
  });

  describe('createQuestion', () => {
    it('should create a new question', async () => {
      const createDto: CreateSurveyQuestionDto = {
        text: 'New question',
        category: QuestionCategory.EMOTIONAL,
        options: ['Yes', 'No'],
      };
      const result = {
        id: 1,
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSurveyService.createQuestion.mockResolvedValue(result);

      expect(await controller.createQuestion(createDto)).toBe(result);
      expect(service.createQuestion).toHaveBeenCalledWith(createDto);
    });
  });
});
