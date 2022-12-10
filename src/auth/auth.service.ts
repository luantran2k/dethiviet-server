import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import console from 'console';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import Ultis from 'src/Utils/Ultis';
import { AuthDto } from './dto/auth.dto';

export interface ChangePasswordCode {
  email: string;
  code: number;
}

export interface ChangePasswordInfo extends ChangePasswordCode {
  password: string;
}

@Injectable()
export class AuthService {
  private changePasswordCodes: ChangePasswordCode[] = [];
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    // Check if user exists
    const userExists = await this.usersService.findByUsername(
      createUserDto.username,
    );
    if (userExists) {
      throw new BadRequestException('Tên tài khoản đã được sử dụng');
    }

    const userExistsEmail = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (userExistsEmail) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
    const tokens = await this.getTokens(newUser.id, newUser.username);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    const { password, refreshToken: rfToken, ...userInfo } = newUser;
    return { ...tokens, userInfo };
  }

  async signIn(data: AuthDto) {
    // Check if user exists
    const user = await this.usersService.findByUsername(data.username);
    if (!user)
      throw new BadRequestException(
        'Tên người dùng không tồn tại, vui lòng thử lại',
      );
    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches)
      throw new BadRequestException('Mật khẩu không đúng, vui lòng thử lại');
    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    const { password, refreshToken: rfToken, ...userInfo } = user;
    return { ...tokens, userInfo };
  }

  async logout(userId: number) {
    await this.usersService.update(userId, { refreshToken: null });
    return { result: 'Success' };
  }

  async hashData(data: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data, salt);
    return hash;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn:
            this.configService.get<string>('ACCESS_TOKEN_EXP') || '30m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn:
            this.configService.get<string>('REFRESH_TOKEN_EXP') || '3d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      this.updateRefreshToken(user.id, null);
      throw new ForbiddenException('Access Denied');
    }
    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    const { password, refreshToken: rfToken, ...userInfo } = user;
    return { ...tokens, userInfo };
  }

  async getChangePasswordCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }
    const codeIndex = this.changePasswordCodes.findIndex(
      (code) => code.email === email,
    );
    if (codeIndex !== -1) {
      throw new BadRequestException(
        'Đã gửi mã xác minh, vui lòng kiểm tra email hoặc thử lại sau 5 phút',
      );
    }
    const newCode = Ultis.getRndInteger(10000, 99999);
    await this.mailService.sendEmail({
      email,
      subject: 'Mã xác nhận mật khẩu',
      content: `Mã xác minh của bạn là: <strong>${newCode}</strong>`,
    });
    this.changePasswordCodes.push({
      email,
      code: newCode,
    });
    setTimeout(() => {
      this.changePasswordCodes.splice(codeIndex, 1);
    }, 5 * 1000 * 60);
    return {
      message: 'Gửi email thành công',
      code: 200,
    };
  }

  async changePassword({ email, code, password }: ChangePasswordInfo) {
    const index = this.changePasswordCodes.findIndex(
      (authCode) => authCode.email === email && authCode.code === code,
    );
    if (index === -1) {
      throw new BadRequestException(
        'Mã xác minh không hợp lệ, vui lòng thử lại',
      );
    }
    this.changePasswordCodes.splice(index, 1);
    const passwordHash = await this.hashData(password);
    const user = await this.usersService.updateByEmail(email, {
      password: passwordHash,
    });
    if (!user) {
      throw new InternalServerErrorException(
        'Cập nhật mật khẩu không thành công server',
      );
    }
    return {
      message: 'Cập nhật mật khẩu thành công',
      code: 200,
    };
  }
}
