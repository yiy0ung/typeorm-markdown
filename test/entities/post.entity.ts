import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostChat } from './post-chat.entity';
import { Board } from './board.entity';
import { User } from './user.entity';

/**
 * 게시판 게시글.
 *
 * @namespace Board
 */
@Entity()
export class Post {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column()
  authorId!: User['id'];

  @ManyToOne(() => Board, board => board.posts)
  @JoinColumn({ name: 'boardId' })
  board!: Board;

  @Column()
  boardId!: Board['id'];

  @Column({ nullable: true })
  title!: string | null;

  @Column()
  body!: string;

  @Column()
  hidden!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => PostChat, chat => chat.post)
  chats!: PostChat[];
}
