import { Module } from '@nestjs/common';
// to load environment variables
import { ConfigModule, ConfigService} from '@nestjs/config';
// to load type orm and connect to postgres
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // global config module
    ConfigModule.forRoot({isGlobal: true}),
    // type module for root async
    TypeOrmModule.forRootAsync({
      // imports the config module to the type orm module
      imports: [ConfigModule], 
      // inject the config service to the type orm module
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres', // type of database
        host: config.get<string>('DB_HOST'), // host of database
        port: config.get<number>('DB_PORT'), // port of database
        username: config.get<string>('DB_USERNAME'), // username of database
        password: config.get<string>('DB_PASSWORD'), // password of database
        database: config.get<string>('DB_NAME'), // name of database
        autoLoadEntities: true, // auto load entities
        synchronize: true, // synchronize database
      })
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
