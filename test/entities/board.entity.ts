import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Post } from './post.entity';
import { BoardMember } from './board-member.entity';

/**
 * 게시판.
 *
 * @namespace board
 */
@Entity()
export class Board {
  /** Primary Key  */
  @PrimaryColumn('uuid')
  id!: string;

  /** 게시판 이름 */
  @Column()
  name!: string;

  @OneToMany(() => BoardMember, boardManager => boardManager.board)
  boardMembers!: BoardMember[];

  /** 게시판에 속하는 게시글들 */
  @OneToMany(() => Post, post => post.board)
  posts!: Post[];
}
