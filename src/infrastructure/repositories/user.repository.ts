import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserModel } from "../../domain/models/user.model";
import { UserRepositoryType } from "../../domain/repositories/user.repositories";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository implements UserRepositoryType {
  constructor(
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>
  ) {}
  async updateRefreshToken(
    username: string,
    refreshToken: string
  ): Promise<void> {
    await this.userEntityRepository.update(
      {
        username: username,
      },
      { hash_refresh_token: refreshToken }
    );
  }
  async getUserByUsername(username: string): Promise<UserModel> {
    const adminUserEntity = await this.userEntityRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!adminUserEntity) {
      return null;
    }
    return this.toUser(adminUserEntity);
  }
  async updateLastLogin(username: string): Promise<void> {
    await this.userEntityRepository.update(
      {
        username: username,
      },
      { last_login: () => "CURRENT_TIMESTAMP" }
    );
  }

  private toUser(adminUserEntity: User): UserModel {
    const adminUser: UserModel = new UserModel();

    adminUser.id = adminUserEntity.id;
    adminUser.username = adminUserEntity.username;
    adminUser.password = adminUserEntity.password;
    adminUser.createDate = adminUserEntity.createDate;
    adminUser.updatedDate = adminUserEntity.updatedDate;
    adminUser.lastLogin = adminUserEntity.last_login;
    adminUser.hashRefreshToken = adminUserEntity.hash_refresh_token;

    return adminUser;
  }

  private toUserEntity(adminUser: UserModel): User {
    const adminUserEntity: User = new User();

    adminUserEntity.username = adminUser.username;
    adminUserEntity.password = adminUser.password;
    adminUserEntity.last_login = adminUser.lastLogin;

    return adminUserEntity;
  }
}
