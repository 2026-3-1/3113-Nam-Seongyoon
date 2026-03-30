import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
