# nestJS+typeORM+graphQL+前端

# 后端

## graphQL依赖

### 安装

- graphql - 基础包
- apollo-server-express - 启动 graphql server
- @nestjs/graphql - 工具包
- @nestjs/apollo - graphql 驱动程序

## nestJS服务

### 注册graphql到全局app module

```tsx
// app.module.ts
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
```

### 创建resolver（相当于controller）

```tsx
// xx.resolver.ts 可以在页面/graphql看到
@Resolver()
export class UserResolver{
  constructor(private readonly userService){}

	//修改 此处的名称会影响graphql返回的key
  @Mutation()
	async create(@Args('params') params: UserInput): Promise<boolean>
		//调用service
		this.userService.create(params)
	}
	
	//查询 此处的名称会影响graphql返回的key
  @Query(() => UserType, { description: '使用ID查询用户' })
	async find(@Args('id') id: string): Promise<UserType>{
		this.userService.find(id);
	}

}
```

## 编写service

```tsx
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
  ) {}

  //新增用户
  async create(entity: DeepPartial<User>): Promise<boolean> {
    const res = await this.UserRepository.insert(entity);
    if (res.raw.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  }
  
  //查询用户
  async find(id: string): Promise<User> {
    const res = await this.UserRepository.findOne({
      where: {
        id,
      },
    });
    return res;
  }
}
```

### 定义数据库实体类型

```tsx
// xx.entity.ts
@Entity('user')
export class User {
	@PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    comment: '昵称',
    default: '',
  })
  @IsNotEmpty()
  name: string;
}
```

### 定义输入输出格式（相当于graphql的实体类型）

```tsx
// xx-input.type.ts 传入参数
@InputType()
export class UserInput {
  @Field({ description: '昵称' })
  name?: string;
  @Field({ description: '简介' })
  desc: string;
  @Field({ description: '头像' })
  avatar: string;
}

// xx.type.ts 输出参数
@ObjectType()
export class UserType {
  @Field()
  id?: string;
  @Field({ description: '昵称' })
  name?: string;
  @Field({ description: '简介' })
  desc: string;
  @Field({ description: '手机号' })
  tel: string;
  @Field({ description: '头像', nullable: true })
  avatar?: string;
}
```

### 拿到数据库实体 将写好的内容注册到需要的模块中

```tsx
//xx.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ConsoleLogger, UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
```

# 前端 react+graphql

## 依赖

npm install @apollo/client graphql

## 配置客户端

```tsx
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: '你的后端GraphQL服务的URL',
  cache: new InMemoryCache(),
});
```

### graphql配置 api组成

- 一个固定url
- 三个查询参数：operationName（方法名）、query（查询语句）、variables（入参）

```tsx
import { gql } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;
```

## 在组件中使用

```tsx
import { useQuery, useMutation } from '@apollo/client';
//查询
const { loading, error, data } = useQuery(GET_USERS);
//修改
const [mutateFunction, { data, loading, error }] = useMutation(CREATE_USER);
```