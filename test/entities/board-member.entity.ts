import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { User } from './user.entity';
import { Board } from './board.entity';

/**
 * 게시판 구성원.
 *
 * @namespace Board
 */
@Entity()
export class BoardMember {
  @PrimaryColumn()
  id!: string;

  @ManyToOne(() => User, user => user.boardMembers)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: User['id'];

  @ManyToOne(() => Board, board => board.boardMembers)
  @JoinColumn({ name: 'boardId' })
  board!: Board;

  @RelationId((boardManager: BoardMember) => boardManager.board)
  boardId!: Board['id'];

  @Column()
  permission!: string;
}
