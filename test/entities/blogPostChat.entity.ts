import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogPost } from './blogPost.entity';
import { User } from './user.entity';

/**
 * 블로그 게시글 댓글.
 *
 * @namespace Blog
 */
@Entity()
export class BlogPostChat {
  /** Primary Key  */
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.postChats)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  /** 댓글을 작성한 User ID */
  @Column({ type: 'varchar' })
  authorId!: User['id'];

  @ManyToOne(() => BlogPost, post => post.chats)
  @JoinColumn({ name: 'postId' })
  post!: BlogPost;

  /** 댓글이 속한 BlogPost ID */
  @Column({ type: 'varchar' })
  postId!: BlogPost['id'];

  /** 내용 */
  @Column()
  body!: string;

  /** 작성일 */
  @CreateDateColumn()
  createdAt!: Date;

  /** 수정일 */
  @UpdateDateColumn()
  updatedAt!: Date;

  /** 삭제일 */
  @DeleteDateColumn()
  deletedAt!: Date | null;
}
