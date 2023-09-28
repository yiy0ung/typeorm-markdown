import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { PostChat } from './post-chat.entity';
import { BoardMember } from './board-member.entity';

/**
 * 사용자.
 *
 * @namespace user
 */
@Entity()
export class User {
  /** Primary Key */
  @PrimaryColumn('uuid')
  id!: string;

  /** 계정 ID */
  @Column()
  account!: string;

  /** 비밀번호 */
  @Column({ select: false })
  password!: string;

  /** 이름 */
  @Column()
  displayName!: string;

  /** 생성일 */
  @CreateDateColumn()
  createdAt!: Date;

  /** 수정일 */
  @UpdateDateColumn()
  updatedAt!: Date;

  /** 탈퇴일 */
  @DeleteDateColumn()
  deletedAt!: Date | null;

  @OneToMany(() => BoardMember, boardManager => boardManager.user)
  boardMembers!: BoardMember[];

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  @OneToMany(() => PostChat, postChat => postChat.author)
  postChats!: PostChat[];
}
