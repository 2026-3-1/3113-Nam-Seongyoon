import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser as CurrentUserDecorator } from '../auth/current-user.decorator';
import type { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  getMySubscriptions(@CurrentUserDecorator() user: CurrentUser) {
    return this.subscriptionService.getMySubscriptions(user.id);
  }

  @Get(':instructorId')
  getStatus(
    @Param('instructorId') instructorId: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.subscriptionService.getStatus(user.id, Number(instructorId));
  }

  @Post(':instructorId')
  subscribe(
    @Param('instructorId') instructorId: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.subscriptionService.subscribe(user.id, Number(instructorId));
  }

  @Delete(':instructorId')
  unsubscribe(
    @Param('instructorId') instructorId: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.subscriptionService.unsubscribe(user.id, Number(instructorId));
  }
}
