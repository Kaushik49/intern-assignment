// data source for the application
import { DataSource } from 'typeorm';
// to load environment variables
import { config } from 'dotenv';
config();

// data source for the application
export const AppDataSource = new DataSource({
  // type of database
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // entities for the application
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  // migrations for the application
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
