# Community

- [Blog](#Blog)
- [User](#User)

## Blog
```mermaid
erDiagram
blog_post_chat {
  uuid id PK 
  unknown authorId FK 
  unknown postId FK 
  string body  
  timestamp createdAt  
  timestamp updatedAt  
  timestamp deletedAt  
}
blog_category {
  uuid id PK 
  varchar blogId FK 
  string name  
  timestamp createdAt  
  timestamp updatedAt  
  timestamp deletedAt  
}
blog {
  uuid id PK 
  varchar ownerId FK 
  string name  
}
blog_post {
  uuid id PK 
  unknown authorId FK 
  unknown blogId FK 
  unknown title  "nullable"
  string body  
  boolean isHidden  
  timestamp createdAt  
  timestamp updatedAt  
  timestamp deletedAt  
}
user {
  uuid id PK 
  string account  
  string password  
  string displayName  
  timestamp createdAt  
  timestamp updatedAt  
  timestamp deletedAt  
}
blog_post_chat }|--|| user : author
blog_post_chat }|--|| blog_post : post
blog_category }|--|| blog : blog
blog |o--|| user : owner
blog_post }|--|| user : author
blog_post }|--|| blog : blog
```
### blog_post_chat
블로그 게시글 댓글.

**Columns**
- `id`: Primary Key
- `authorId`
  > 댓글을 작성한 User ID
  > 
  > Belonged blog_post_chat's [blog_post_chat.id](#blog_post_chat)
- `postId`
  > 댓글이 속한 BlogPost ID
  > 
  > Belonged blog_post_chat's [blog_post_chat.id](#blog_post_chat)
- `body`: 내용
- `createdAt`: 작성일
- `updatedAt`: 수정일
- `deletedAt`: 삭제일

### blog_category
블로그 카테고리.

**Columns**
- `id`: Primary Key
- `blogId`
  > 카테고리가 속한 Blog ID
  > 
  > Belonged blog_category's [blog_category.id](#blog_category)
- `name`: 카테고리 명
- `createdAt`: 생성일
- `updatedAt`: 수정일
- `deletedAt`: 삭제일

### blog
블로그.

블로그는 각 유저별로 하나씩 소유가 가능하며
사용자가 작성한 게시글을 모아서 보여준다.

**Columns**
- `id`: Primary Key
- `ownerId`
  > 블로그 관리자 User ID
  > 
  > Belonged blog's [blog.id](#blog)
- `name`: 블로그 이름

### blog_post
블로그 게시글.

**Columns**
- `id`: Primary Key
- `authorId`
  > 게시글 작성자 User ID
  > 
  > Belonged blog_post's [blog_post.id](#blog_post)
- `blogId`
  > 게시글이 속한 Blog ID
  > 
  > Belonged blog_post's [blog_post.id](#blog_post)
- `title`: 제목
- `body`: 내용
- `isHidden`: 숨김 여부
- `createdAt`: 작성일
- `updatedAt`: 수정일
- `deletedAt`: 삭제일

## User
```mermaid
erDiagram
user {
  uuid id PK 
  string account  
  string password  
  string displayName  
  timestamp createdAt  
  timestamp updatedAt  
  timestamp deletedAt  
}
```
### user
사용자.

**Columns**
- `id`: Primary Key
- `account`: 계정 ID
- `password`: 비밀번호
- `displayName`: 이름
- `createdAt`: 생성일
- `updatedAt`: 수정일
- `deletedAt`
  > 삭제일.
  > 
  > 삭제일이 있다는 것은 탈퇴를 의미한다.

