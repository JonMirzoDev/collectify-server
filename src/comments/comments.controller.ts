import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/create-comment.dto';

interface AuthenticatedUser {
  id: number;
  isAdmin?: boolean;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.createComment(
      req.user.id,
      createCommentDto.itemId,
      createCommentDto.text,
    );
  }

  @Get('/item/:itemId')
  getCommentsByItem(@Param('itemId') itemId: string) {
    return this.commentsService.getCommentsByItem(+itemId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  deleteComment(
    @Param('commentId') commentId: string,
    @Req() req: RequestWithUser,
  ) {
    const isAdmin = req.user.isAdmin || false;
    return this.commentsService.deleteComment(+commentId, req.user.id, isAdmin);
  }
}
