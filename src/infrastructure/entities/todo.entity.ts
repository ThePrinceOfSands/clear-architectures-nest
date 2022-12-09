import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Todo {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column("varchar", { length: 255, nullable: true })
  content: string;

  @Column("boolean", { default: false })
  isDone: boolean;

  @CreateDateColumn({ name: "create-date" })
  createDate: Date;

  @UpdateDateColumn({ name: "updated-date" })
  updatedDate: Date;
}