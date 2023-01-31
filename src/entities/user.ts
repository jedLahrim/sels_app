import {
  Column,
  Entity,
  PrimaryColumnCannotBeNullableError,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsString } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  @IsString()
  first_name: string;
  @Column()
  @IsString()
  last_name: string;
  @Column()
  @IsString()
  email: string;
  @Column({ default: null })
  @IsString()
  password: string;
  @Column({ default: true })
  activated: boolean;
  access: string;
  refresh: string;
  refresh_expire_at: Date;
  access_expire_at: Date;
}
