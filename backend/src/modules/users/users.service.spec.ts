import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserDoc = {
    _id: 'usr_mock_123',
    email: 'cinephile@example.com',
    name: 'Alex MovieFan',
    passwordHash: 'hashed_pw',
    save: jest.fn().mockResolvedValue({
      _id: 'usr_mock_123',
      email: 'cinephile@example.com',
      name: 'Alex MovieFan',
    }),
  };

  function MockUserModel(dto: any) {
    this.email = dto.email;
    this.name = dto.name;
    this.save = mockUserDoc.save;
  }

  MockUserModel.findOne = jest.fn();
  MockUserModel.findById = jest.fn();
  MockUserModel.findByIdAndUpdate = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user when email does not exist', async () => {
    MockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await service.create({
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      name: 'New Cinephile',
    });

    expect(result).toBeDefined();
    expect(MockUserModel.findOne).toHaveBeenCalled();
  });

  it('should throw ConflictException when email already exists', async () => {
    MockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUserDoc),
    });

    await expect(
      service.create({
        email: 'cinephile@example.com',
        password: 'StrongPassword123!',
        name: 'Alex MovieFan',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
