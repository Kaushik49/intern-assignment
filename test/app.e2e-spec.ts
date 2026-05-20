import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/user.entity';
import { Repository } from 'typeorm';

describe('App & Auth (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  beforeEach(async () => {
    // Clean database before each test
    await userRepository.clear();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/auth', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('POST /auth/register should register a user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('password');
    });

    it('POST /auth/register should fail for an already registered email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409); // ConflictException
    });

    it('POST /auth/login should log in a registered user and return a JWT', async () => {
      // 1. Register the user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // 2. Log in
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(201);

      expect(loginResponse.body).toHaveProperty('access_token');
      expect(typeof loginResponse.body.access_token).toBe('string');
    });

    it('POST /auth/login should reject invalid credentials', async () => {
      // 1. Register the user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // 2. Try logging in with wrong password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('GET /auth/profile should guard the route and require a valid token', async () => {
      // 1. Try accessing profile without authorization
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);

      // 2. Register
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // 3. Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(201);

      const token = loginResponse.body.access_token;

      // 4. Try accessing profile with a valid token
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('id');
      expect(profileResponse.body.email).toBe(testUser.email);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
