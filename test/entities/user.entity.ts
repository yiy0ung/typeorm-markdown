import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogPost } from './blogPost.entity';
import { BlogPostChat } from './blogPostChat.entity';
import { Blog } from './blog.entity';
import { BlogPostHit } from './blogPostHit.entity';

/**
 * 사용자.
 *
 * @namespace User
 * @erd Blog
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

  /**
   * 삭제일.
   *
   * 삭제일이 있다는 것은 탈퇴를 의미한다.
   */
  @DeleteDateColumn()
  deletedAt!: Date | null;

  @OneToOne(() => Blog, blog => blog.owner)
  myBlog!: Blog[];

  @OneToMany(() => BlogPost, post => post.author)
  posts!: BlogPost[];

  @OneToMany(() => BlogPostChat, postChat => postChat.author)
  postChats!: BlogPostChat[];

  @OneToMany(() => BlogPostHit, postHit => postHit.user)
  postHits!: BlogPostHit[];
}
