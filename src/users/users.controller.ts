import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpCode,
  UseGuards,
  Put,
  Param,
  HttpException,
  Delete,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDTO } from './dto/register-user.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put(':id/admin')
  async makeAdmin(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.usersService.makeAdmin(user);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put(':id/admin/remove')
  async removeAdminStatus(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.usersService.removeAdminStatus(user);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put(':id/block')
  async blockUser(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.usersService.blockUser(user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() userData: RegisterUserDTO) {
    return this.usersService.register(userData);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put(':id/unblock')
  async unblockUser(@Param('id') id: number) {
    return this.usersService.changeBlockStatus(id, false);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
