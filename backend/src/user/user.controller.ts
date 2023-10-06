import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	Res,
	UseGuards,
	UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserService } from './user.service';
import { CreateUser } from '../../../contracts/user.schema--';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Request } from 'express';
@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}
	@UsePipes(ZodValidationPipe)
	//@ApiTags('user')
	@Post('create')
	//@ApiOperation({ summary: 'Create user' })
	async createUser(
		@Body()
		userData: CreateUser.Request,
	): Promise<User> {
		return this.userService.createUser(userData);
	}

	@Get('getProfile/:id')
	async getProfile(@Param('id', ParseIntPipe) id: number) {
		return await this.userService.getProfile(id);
	}

	@Post('updateProfile/:id')
	async updateProfile(
		@Param('id', ParseIntPipe) userId: number,
		@Body() userData: any,
	) {
		return await this.userService.updateUser(userId, userData);
	}
}
