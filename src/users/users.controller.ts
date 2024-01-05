import { Body, Controller, Post, HttpStatus, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDTO } from './dto/register-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() userData: RegisterUserDTO) {
    return this.usersService.register(userData);
  }
}
