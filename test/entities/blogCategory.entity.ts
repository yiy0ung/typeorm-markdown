import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Blog } from './blog.entity';
import { BlogPostCategoryPair } from './blogPostCategoryPair.entity';

/**
 * 블로그 카테고리.
 *
 * @namespace Blog
 */
@Entity()
export class BlogCategory {
  /** Primary Key  */
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => Blog, blog => blog.categories)
  @JoinColumn({ name: 'blogId' })
  blog!: Blog;

  /** 카테고리가 속한 Blog ID */
  @Column({ type: 'varchar' })
  blogId!: Blog['id'];

  /** 카테고리 명 */
  @Column()
  name!: string;

  /** 생성일 */
  @CreateDateColumn()
  createdAt!: Date;

  /** 수정일 */
  @UpdateDateColumn()
  updatedAt!: Date;

  /** 삭제일 */
  @DeleteDateColumn()
  deletedAt!: Date;

  @OneToMany(() => BlogPostCategoryPair, blogPostCategoryPair => blogPostCategoryPair.post)
  postPairs!: BlogPostCategoryPair[];
}
