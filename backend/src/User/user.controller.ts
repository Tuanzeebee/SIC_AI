import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  HttpCode, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Get('user/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(parseInt(id));
  }

  @Get('user/email/:email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }
}
