import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from '@nestjs/passport';

interface AuthenticatedUser {
  id: number;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':itemId/like')
  likeItem(@Param('itemId') itemId: string, @Req() req: RequestWithUser) {
    return this.likesService.likeItem(req.user.id, +itemId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':itemId/dislike')
  dislikeItem(@Param('itemId') itemId: string, @Req() req: RequestWithUser) {
    return this.likesService.dislikeItem(req.user.id, +itemId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':itemId/status')
  getLikeStatus(@Param('itemId') itemId: string, @Req() req: RequestWithUser) {
    return this.likesService.getLikeStatus(req.user.id, +itemId);
  }
}
