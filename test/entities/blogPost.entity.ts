import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogPostChat } from './blogPostChat.entity';
import { Blog } from './blog.entity';
import { User } from './user.entity';
import { BlogPostCategoryPair } from './blogPostCategoryPair';

/**
 * 블로그 게시글.
 *
 * @namespace Blog
 */
@Entity()
export class BlogPost {
  /** Primary Key  */
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  /** 게시글 작성자 User ID */
  @Column()
  authorId!: User['id'];

  @ManyToOne(() => Blog, blog => blog.posts)
  @JoinColumn({ name: 'blogId' })
  blog!: Blog;

  /** 게시글이 속한 Blog ID */
  @Column()
  blogId!: Blog['id'];

  /** 제목 */
  @Column({ nullable: true })
  title!: string | null;

  /** 내용 */
  @Column()
  body!: string;

  /** 숨김 여부 */
  @Column()
  isHidden!: boolean;

  /** 작성일 */
  @CreateDateColumn()
  createdAt!: Date;

  /** 수정일 */
  @UpdateDateColumn()
  updatedAt!: Date;

  /** 삭제일 */
  @DeleteDateColumn()
  deletedAt!: Date;

  @OneToMany(() => BlogPostCategoryPair, blogPostCategoryPair => blogPostCategoryPair.post)
  categoryPairs!: BlogPostCategoryPair[];

  @OneToMany(() => BlogPostChat, chat => chat.post)
  chats!: BlogPostChat[];
}
