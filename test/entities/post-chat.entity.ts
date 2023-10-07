import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

/**
 * 게시판 게시글 댓글.
 *
 * @namespace Board
 */
@Entity()
export class PostChat {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.postChats)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column()
  authorId!: User['id'];

  @ManyToOne(() => Post, post => post.chats)
  @JoinColumn({ name: 'postId' })
  post!: Post;

  @Column()
  postId!: Post['id'];

  @Column()
  body!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
