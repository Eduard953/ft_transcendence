import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
  ForbiddenException,
  //   Put,
  //   Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { CreateUser, UpdateAvatar, UpdateEmail, UpdateUsername } from '../../../zod_contracts/user.schema';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  
  @Get('user')
  async listAllUsers() {
    return await this.userService.listAllUsers();
  }


  @Get('user/all')
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get('user/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserById(id);
  }

  @Post('user/create')
  async signupUser(@Body() userData: CreateUser.Request): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Post('user/update/email')
  async updateEmail(@Body() updateData: UpdateEmail.Request): Promise<UserModel> {
	try {
		const result = await this.userService.updateEmail(updateData);
		return result;
	}
	catch {
		throw new ForbiddenException('Email already taken');
	}
  }

  @Post('user/update/username')
  async updateUsername(@Body() updateData: UpdateUsername.Request): Promise<UserModel> {
	try {
		const result = await this.userService.updateUsername(updateData);
		return result;
	}
	catch {
		throw new ForbiddenException('Username already taken');
	}
  }

  @Post('user/update/avatar')
  async updateAvatar(@Body() updateData: UpdateAvatar.Request): Promise<UserModel> {
	return this.userService.updateAvatar(updateData);
  }

}
