import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDTO } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async register(userData: RegisterUserDTO): Promise<Omit<User, 'password'>> {
    const userExists = await this.usersRepository.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });

    if (userExists) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.usersRepository.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
    });

    await this.usersRepository.save(newUser);

    const { password, ...result } = newUser;
    return result;
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
