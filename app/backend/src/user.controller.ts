import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser as CurrentUserDecorator } from './auth/current-user.decorator';
import type { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';
import { UserRole } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me/mypage')
  getMyPage(@CurrentUserDecorator() user: CurrentUser) {
    return this.userService.getMyPage(user);
  }

  @Get('me/notification-preferences')
  getNotificationPreferences(@CurrentUserDecorator() user: CurrentUser) {
    return this.userService.getNotificationPreferences(user.id);
  }

  @Patch('me/notification-preferences')
  updateNotificationPreferences(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: { emailNotifications: boolean },
  ) {
    return this.userService.updateNotificationPreferences(
      user.id,
      dto.emailNotifications,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }
}
