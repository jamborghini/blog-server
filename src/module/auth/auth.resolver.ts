import { Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from 'src/module/auth/service/auth.service';
import { User } from 'src/module/user/model/user';
import { CreateUser } from 'src/module/user/input/create-user';
import { LoginInput } from 'src/module/auth/input/login-input';
import { RegisterProducerService } from 'src/module/auth/service/register.producer.service';
import { RegisterResponse } from 'src/module/auth/model/register-response';
import { GQLContext } from 'src/module/auth/guard/interface/role';
import { Payload } from 'src/module/shared/decorator/param/payload';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly registerService: RegisterProducerService,
  ) {}

  @Mutation(() => RegisterResponse)
  async register(@Payload() payload: CreateUser): Promise<RegisterResponse> {
    return await this.registerService.addToRegisterQueue(payload);
  }

  @Mutation(() => User)
  async login(
    @Payload() payload: LoginInput,
    @Context() { req }: GQLContext,
  ): Promise<User> {
    return await this.authService.validate(payload).then((user) => {
      req.session.userId = user.id;
      return user;
    });
  }

  @Mutation(() => Boolean)
  async logout(@Context() { req, res }: GQLContext): Promise<boolean> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          return reject(false);
        }
      });

      res.clearCookie('qid');

      return resolve(true);
    });
  }
}
