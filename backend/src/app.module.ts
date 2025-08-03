// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './PrismaService/prisma.service';
import { UserModule } from './User/user.module';
import { SurveyModule } from './Survey/survey.module';
import { ScoreRecordModule } from './ScoreRecord/score-record.module';
import { PartTimeHourSaveModule } from './PartTimeHourSave/part-time-hour-save.module';
import { CalculatorCreditModule } from './CalculatorCredit/calculator-credit.module';
import { CalculatorGpaModule } from './CalculatorGpa/calculator-gpa.module';
import { PredictionReverseModule } from './PredictionReverse/prediction-reverse.module';
import { PredictionInputScoreModule } from './PredictionInputScore/prediction-input-score.module';
import { PredictionScoreModule } from './prediction-score/prediction-score.module';

@Module({
  imports: [UserModule, SurveyModule, ScoreRecordModule, PartTimeHourSaveModule, CalculatorCreditModule, CalculatorGpaModule, PredictionReverseModule, PredictionInputScoreModule, PredictionScoreModule],
  controllers: [AppController],
  providers: [AppService, PrismaService], 
})
export class AppModule {}
