import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class Post {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  title!: string | null;

  @Column()
  body!: string;

  @OneToMany(() => Chat, chat => chat.post)
  chats!: Chat[];
}
