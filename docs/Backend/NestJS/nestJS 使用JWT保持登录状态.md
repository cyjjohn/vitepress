# nestJS 使用JWT保持登录状态

## 安装依赖

```tsx
npm i @nestjs/jwt @nestjs/passport passport passport-jwt
```

## 注册Module

```tsx
@Module({
  imports: [
    JwtModule.register({ // 注册JwtModule
      secret: 'secretKey', // 设置加密密钥
      signOptions: { expiresIn: '1h' }, // 设置token过期时间
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}

```

## 自定义JWT策略

```tsx
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 在策略中，我们需要定义校验逻辑，可以利用Passport中的策略
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 定义如何从请求中提取JWT
      ignoreExpiration: false, // 是否忽略过期Token
      secretOrKey: 'secretKey', // 用于签名的密钥
    });
  }

  // 验证函数
  async validate(payload: any) {
	  // 自定义验证
    return { userId: payload.sub, username: payload.username };
  }
}

```

## 创建JWT服务

```tsx
// jwt.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // 创建jwt
  async createToken() {
    const user = { email: 'test@nestjs.com' };
    
    return {
      expires_in: 3600,
      access_token: token,
      user: user,
    };
  }
}

```

## 创建Guard 引入JWT策略

```tsx
// jwt.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	// jwt和graphql request转换
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

```

## 修改登录接口

```tsx
// app.controller.ts

import { Controller, UseGuards, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login() {
	  const token = this.jwtService.sign(payload);
    return this.authService.createToken();
  }
}

```

## 需要验证的类或方法上使用Guard

```tsx

  @UseGuards(JwtAuthGuard)
```