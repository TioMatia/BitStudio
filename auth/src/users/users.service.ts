import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashedPassword });
    return this.userRepo.save(user);
  }

    async findByEmail(email: string) {
    return this.userRepo
        .createQueryBuilder('user')
        .addSelect('user.password') 
        .where('user.email = :email', { email })
        .getOne();
    }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOne(id: number): Promise<User | null> {
  return this.userRepo.findOne({ where: { id } });
  }

   async findPaginated(options: {
      page: number;
      limit: number;
      sortKey: string;
      sortDir: 'asc' | 'desc';
    }) {
      const { page, limit, sortKey, sortDir } = options;

      
      const validSortKeys = ['id', 'firstName', 'lastName', 'email', 'createdAt'];
      if (!validSortKeys.includes(sortKey)) {
        throw new BadRequestException('Clave de orden inválida');
      }

      const query = this.userRepo.createQueryBuilder('user');

      query.orderBy(`user.${sortKey}`, sortDir.toUpperCase() as 'ASC' | 'DESC');

      const [data, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        total,
        page,
        pageCount: Math.ceil(total / limit),
      };
    }

    
  async connectMercadoPago(userId: number, accessToken: string, mpUserId: string) {
  return this.userRepo.update(userId, {
    mpAccessToken: accessToken,
    mpUserId: mpUserId,
  });
}

}
