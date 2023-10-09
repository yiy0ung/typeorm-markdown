import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { BlogPost } from './blogPost.entity';

/**
 * @namespace Blog
 * @hidden
 */
@Entity()
export class BlogPostHit {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => BlogPost, blogPost => blogPost.hits)
  @JoinColumn({ name: 'postId' })
  post!: BlogPost;

  @Column({ type: 'varchar' })
  postId!: BlogPost['id'];

  @ManyToOne(() => User, user => user.postHits)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar' })
  userId!: User['id'];

  @CreateDateColumn()
  createdAt!: Date;
}
