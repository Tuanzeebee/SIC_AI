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
import { PostsService } from './Post/post.service';
import { UsersService } from './User/user.service'; 
import { PrismaService } from './PrismaService/prisma.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PostsService, UsersService,PrismaService], 
})
export class AppModule {}
