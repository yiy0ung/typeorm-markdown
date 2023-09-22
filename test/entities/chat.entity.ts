import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class Chat {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => Post, post => post.chats)
  @JoinColumn({ name: 'postId' })
  post!: Post;

  @Column()
  postId!: Post['id'];

  @Column()
  body!: string;
}
