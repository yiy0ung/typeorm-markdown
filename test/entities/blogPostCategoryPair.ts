import { Column, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BlogPost } from './blogPost.entity';
import { BlogCategory } from './blogCategory.entity';

/**
 * BlogPost, BlogCategory N:M 테이블
 *
 * @namespace Blog
 */
export class BlogPostCategoryPair {
  /** Primary Key  */
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => BlogPost, blogPost => blogPost.categoryPairs)
  @JoinColumn({ name: 'postId' })
  post!: BlogPost;

  @Column({ type: 'varchar' })
  postId!: BlogPost['id'];

  @ManyToOne(() => BlogCategory, blogCategory => blogCategory.postPairs)
  @JoinColumn({ name: 'categoryId' })
  category!: BlogCategory;

  @Column({ type: 'varchar' })
  categoryId!: BlogCategory['id'];
}
