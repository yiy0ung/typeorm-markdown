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
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  account!: string;

  @Column({ select: false })
  password!: string;

  @Column()
  displayName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @OneToMany(() => BoardMember, boardManager => boardManager.user)
  boardMembers!: BoardMember[];

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  @OneToMany(() => PostChat, postChat => postChat.author)
  postChats!: PostChat[];
}
