import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        accessToken: any;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    register(dto: CreateUserDto): Promise<{
        accessToken: any;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
}
