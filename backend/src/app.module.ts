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

@Module({
  imports: [UserModule, SurveyModule, ScoreRecordModule, PartTimeHourSaveModule],
  controllers: [AppController],
  providers: [AppService, PrismaService], 
})
export class AppModule {}
