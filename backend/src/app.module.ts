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

@Module({
  imports: [UserModule, SurveyModule],
  controllers: [AppController],
  providers: [AppService, PrismaService], 
})
export class AppModule {}
