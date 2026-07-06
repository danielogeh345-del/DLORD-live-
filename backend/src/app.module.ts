import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as redisStore from 'cache-manager-redis-store';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { VideosModule } from '@videos/videos.module';
import { StreamingModule } from '@streaming/streaming.module';
import { MessagingModule } from '@messaging/messaging.module';
import { NotificationsModule } from '@notifications/notifications.module';
import { AnalyticsModule } from '@analytics/analytics.module';
import { PaymentsModule } from '@payments/payments.module';
import { AdminModule } from '@admin/admin.module';
import { join } from 'path';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
        migrations: [join(__dirname, 'database/migrations/*{.ts,.js}')],
        subscribers: [join(__dirname, 'database/subscribers/*{.ts,.js}')],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        ssl: configService.get('DB_SSL') === 'true',
      }),
    }),

    // Cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB'),
        ttl: 3600,
      }),
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req }) => ({ req }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    VideosModule,
    StreamingModule,
    MessagingModule,
    NotificationsModule,
    AnalyticsModule,
    PaymentsModule,
    AdminModule,
  ],
})
export class AppModule {}
