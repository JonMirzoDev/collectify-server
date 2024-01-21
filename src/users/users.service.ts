import {
  Injectable,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDTO } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { Collection } from 'src/collections/entities/collection.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        isBlocked: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async makeAdmin(user): Promise<User> {
    user.isAdmin = true;
    return this.usersRepository.save(user);
  }

  async removeAdminStatus(user): Promise<User> {
    user.isAdmin = false;
    return this.usersRepository.save(user);
  }

  async blockUser(user): Promise<User> {
    user.isBlocked = true;
    return this.usersRepository.save(user);
  }

  async changeAdminStatus(userId: number, isAdmin: boolean): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    user.isAdmin = isAdmin;
    return this.usersRepository.save(user);
  }

  async changeBlockStatus(userId: number, isBlocked: boolean): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    user.isBlocked = isBlocked;
    return this.usersRepository.save(user);
  }

  async remove(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Remove related collections first
    await this.collectionsRepository.delete({ userId: user.id });

    // Now it's safe to remove the user
    await this.usersRepository.remove(user);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async register(userData: RegisterUserDTO): Promise<Omit<User, 'password'>> {
    const userBlocked = await this.usersRepository.findOne({
      where: { email: userData.email, isBlocked: true },
    });

    if (userBlocked) {
      throw new HttpException('User is blocked', HttpStatus.FORBIDDEN);
    }

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
