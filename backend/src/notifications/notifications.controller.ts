import {
  Controller,
  Get,
  ParseIntPipe,
  Patch,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Users } from '../database/entities/entities/Users';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findForCurrentUser(
    @CurrentUser() user: Users,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findForUser(user.id, Number(limit));
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: Users) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }
}
