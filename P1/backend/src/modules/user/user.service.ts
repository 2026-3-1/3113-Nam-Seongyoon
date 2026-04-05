import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  // constructor(
  //   @InjectRepository(User)
  //   private readonly userRepo: Repository<User>,
  // ) {}

  async create(dto: CreateUserDto): Promise<any> {
    // const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    // if (exists) throw new ConflictException('이미 사용 중인 이메일입니다.');

    // const passwordHash = await bcrypt.hash(dto.password, 10);
    // const user = this.userRepo.create({ ...dto, passwordHash, isActive: true });
    // return this.userRepo.save(user);
    return { id: 1, ...dto };
  }

  async findAll(): Promise<any[]> {
    // return this.userRepo.find();
    return [];
  }

  async findOne(id: number): Promise<any> {
    // const user = await this.userRepo.findOne({ where: { id } });
    // if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    // return user;
    return { id, name: 'Test' };
  }

  async findByEmail(email: string): Promise<any | null> {
    // return this.userRepo.findOne({ where: { email } });
    return null;
  }

  async update(id: number, dto: any): Promise<any> {
    // const user = await this.findOne(id);
    // if (dto.password) {
    //   (dto as any).passwordHash = await bcrypt.hash(dto.password, 10);
    //   delete dto.password;
    // }
    // Object.assign(user, dto);
    // return this.userRepo.save(user);
    return { id, ...dto };
  }

  async remove(id: number): Promise<void> {
    // const user = await this.findOne(id);
    // await this.userRepo.remove(user);
  }
}
