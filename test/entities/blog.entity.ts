import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { BlogPost } from './blogPost.entity';
import { User } from './user.entity';
import { BlogCategory } from './blogCategory.entity';

/**
 * 블로그.
 *
 * 블로그는 각 유저별로 하나씩 소유가 가능하며
 * 사용자가 작성한 게시글을 모아서 보여준다.
 *
 * @namespace Blog
 */
@Entity()
export class Blog {
  /** Primary Key  */
  @PrimaryColumn('uuid')
  id!: string;

  /** 블로그 관리자 */
  @OneToOne(() => User, user => user.myBlog)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  /** 블로그 관리자 User ID */
  @Column({ type: 'varchar' })
  ownerId!: User['id'];

  /** 블로그 이름 */
  @Column()
  name!: string;

  /** 블로그 소개글 */
  introduction!: string;

  @OneToMany(() => BlogPost, post => post.blog)
  posts!: BlogPost[];

  @OneToMany(() => BlogCategory, category => category.blog)
  categories!: BlogCategory[];
}
