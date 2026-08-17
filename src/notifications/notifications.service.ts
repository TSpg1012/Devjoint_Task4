import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  @OnEvent('show.created')
  async handleShowCreatedEvent(payload: { id: number; title: string }) {
    // simulate a slow email/notification send, without blocking the HTTP response
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.logger.log(`Notification sent: "${payload.title}" (id: ${payload.id}) added to catalog`);
  }
}