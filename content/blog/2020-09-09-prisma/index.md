---
title: 'Prisma - Schema, Data Model, Relations, Client'
path: blog/20190909
tags: [prisma]
date: 2019-09-09
excerpt: 未來 Side project 可能會應用到的 SDL first 開發流程角度，簡介此可以取代傳統 ORM 的 DB toolkit。
---

[HackMD](https://hackmd.io/mOTKzMwoRyaDvP2NkyV6MQ?view)

> Prisma replaces traditional ORMs and can be used to build GraphQL servers, REST APIs, microservices & more.

# Prisma Schema

- 我們採用 `schema.prisma` 定義完 prisma schema 後，才建立、修改 MySQL 的 Tables 的方式，所以從這開始
- 想了解對應的 sql 語句請[自行參考 DATABASE WORKFLOWS 反推](https://www.prisma.io/docs/guides/database-workflows/unique-constraints-and-indexes)

以下都是在 `schema.prisma` 裡

## Generators

指定 `prisma generate` 產的 assets

```json
generator client {
  provider      = "prisma-client-js"
  output        = "node_modules/@prisma/client" # default
  binaryTargets = ["native"]    # default 指定為目前的 OS
}
```

- `provider` required：目前用 `prisma-client-js`
- `output` optinal：Prisma Client 位置（Default: node_modules/@prisma/client）
- [`binaryTargets` optional](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/generators/#binary-targets)：指定 Prisma Client run 在哪個 OS
  - 例：Mac OS `binaryTargets = ["darwin"]`

## Specify a MySQL data source

`schema.prisma` 最上方
MySQL connection URL:`mysql://USER:PASSWORD@HOST:PORT/DATABASE`
![](https://i.imgur.com/9ajoHE5.png)
[Arguments 就有需求再來查，可以設定些連線相關](https://www.prisma.io/docs/reference/database-connectors/mysql#connection-details)

```json
datasource mysql {
  provider = "mysql"
  url      = "mysql://johndoe:mypassword@localhost:5432/mydb"
}
```

## Data Model

### Model, Scalar Type, Enum

- Model 可以代表 db 的 table、prisma client queries 的基底
- Model 的 field 型別可以定義成 1. Scalar Type：String, Boolean, Int, Float, DateTime(Date), JSON(Object)、Enum \* Enum：固定 constant 可以宣告成 enum
  `jsonld enum Role { USER ADMIN } model User { id Int @id @default(autoincrement()) role Role }` 2. Model（relation field）
- Type modifiers：`[]`, `?`
  - List 的表示法 `MODELNAME[]`
    Scalar list 只適用 data model（作為 relation field）
    例如 `posts Post[]` \* 允許空值的 field 記得 TYPE 右邊加 `?`（optional），table 中會存為 NULL，例如 `headThumb String? @map(name: "head_thumb")`（List 例外它不需要加）；一般是 required
- Models、Fields、Enums naming：`[A-Za-z][A-Za-z0-9_]*`
  - Models、Enums 習慣 PascalCase
  - Fields 習慣 camelCase

### Attributes, Functions

除了 List 以外，都可以配置 attribue 修飾符代表、約束，常用如

- attributes（幾乎都有可以刪除的 argument name，可以約定都簡寫）
  `@` for field; `@@` for block
  - `@id` 每個 Model 最多一個
    - field id 通常會搭配預設值，例 `@default(autoincrement())` 預設+1
    - 組合 id，例 `@@id([title, author])`、`@@id(fields: [title, author])`
  - `@default(VALUE)` field 未給塞預設值
    - 例：`@default(now())`、`@default(value: autoincrement())`
  - `@unique` 限制 field 唯一
    - 組合 fields `@@unique` 限制唯一，例 `@@unique([title, author])`、`@@unique(fields: [title, author])`
    - 補充：SQL 中 PRIMARY KEY 是用來保證欄位在資料表中的唯一性，主鍵欄位中的每一筆資料在資料表中都必需是獨一無二的（通常為 id）
      - PRIMARY KEY 有點類似 UNIQUE 加上 NOT NULL
      - 一個資料表中只能有一個 PRIMARY KEY，但是可以有多個 UNIQUE
  - `@@index` 建立索引，利於查詢效率（空間換速度）
    - 通常會在 Primary Key、Foreign Key 或常放在查詢子句中的 field 建立索引，例 `@@index([title, author])`、`@@index(fields: [title, author])`
  - `@updatedAt` 有更動該筆資料時自動更新更新時間
  - `@map` 映射與 field 不同名的 table column；`@@map` 映射與 model 不同名的 table name
    - 例：`@map("is_admin")`、`@map(name: "is_admin")`
    - ```json
                  enum Role {
        ADMIN     @map("admin")
        CUSTOMER  @map("customer")
        @@map("_Role")
      }
      ```
  - `@relation` 關聯其他 model (table)，當中最複雜就它，後面再介紹。[想先了解熟悉可看這](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#the-relation-attribute)
    ```json
            @relation(fields: [userId], references: [id])
    @relation(fields: [userFirstName, userLastName], references: [firstName, lastName])
    @relation(name: "UserOnPost", references: [id])
    @relation("UserOnPost", references: [id])
    # 關聯的都是 id 時可以省略 references
    @relation(name: "UserOnPost")
    @relation("UserOnPost")
    ```
- functions (通常用在 default)
  - `autoincrement()` 新增的資料 id 自動 +1（Int）
  - `cuid()` 根據 cuid spec 產生 globally unique identifier
  - `uuid()` 根據 UUID spec 產生 globally unique identifier
  - `now()` 常用於新增資料的建立時間預設值（DateTime）

## Unique constraints `@unique`

MySQL 的 constraint / index，在 prisma model 是設 `@unique` 限定唯一，可以單獨 column 設、也可以多個 column 組合成唯一（再另外命名），一張表可以有多個 unique
可以在建立 table 時就先設好，或是建好的 table 再修改
id 有 `@id` 就也是唯一了不需要給 `@unique`

```json
model User {
  firstName String?
  id        Int     @default(autoincrement()) @id # 這邊 default 是指不需要給它會自動+1
  lastName  String?
  account   String  @unique
  @@unique([firstName, lastName], name: "firstName")
}
```

## [Connect Model `@relation` 🔆](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations)

- MySQL 表和表之間的關聯方式，建立表格時留個存關聯的表的 id 的 column，這個與外表關聯的 id 就是 foreign key（習慣叫 xxxId）；在 prisma model 間的關聯則是設 `@relation`
- Relation fields：沒有 Scalar Type，其 Type 是其他 Model。每個表和表的關聯，兩方會各有一或多個 relation field
- `@relation(_ name: String?, fields: FieldReference[]?, references: FieldReference[]?)`

Relation 有三種 `1-1`、`1-n`、`m-n`
直接邊看範例邊了解：
Ｑ：假設今天有 User、Profile、Category、Post 四個 Model，試著講出他們的關係：

> User ↔ Profile
> User ↔ Post
> Post ↔ Category

Ｑ：會怎麼實作 Model 會怎麼實作間的關聯？
![](https://i.imgur.com/YNLZHl2.png)

```json
model User {
  id      Int      @id @default(autoincrement())
  posts   Post[]
  profile Profile?
}
model Profile {
  id      Int     @id @default(autoincrement())
  user    User    @relation(fields: [userId], references: [id])
  userId  Int
}
model Post {
  id         Int         @id @default(autoincrement())
  author     User        @relation(fields: [authorId], references: [id])
  authorId   Int
  categories Category[]  @relation(references: [id])
}
model Category {
  id     Int     @id @default(autoincrement())
  posts  Post[]  @relation(references: [id])
}
```

### 一對一 1-1 relation

情境：每個 User 可能會有自己的 Profile
寫法一：forign key 在 Profile

```json
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}
model Profile {
  id      Int     @id @default(autoincrement())
  user    User    @relation(fields: [userId], references: [id])
  userId  Int     // relation scalar field
}
```

![](https://i.imgur.com/32zx3NN.png)
寫法二：forign key 在 User

```json
model User {
  id         Int       @id @default(autoincrement())
  profile    Profile?  @relation(fields: [profileId], references: [id])
  profileId  Int?      // relation scalar field
}
model Profile {
  id      Int     @id @default(autoincrement())
  user    User
}
```

![](https://i.imgur.com/GoUQKya.png)
補充：multi-field IDs 時的 1-1

```json
model User {
  firstName String
  lastName  String
  profile   Profile?
  @@id([firstName, lastName])
}
model Profile {
  id               Int      @id @default(autoincrement())
  user             User     @relation(fields: [authorFirstName, authorLastName], references: [firstName, lastName])
  authorFirstName  String   // relation scalar field
  authorLastName   String   // relation scalar field
}
```

### 一對多 1-n relation

forign key 會在 non-list field
情境：每一 User 能有多篇 Post

```json
model User {
  id      Int      @id @default(autoincrement())
  posts   Post[]
}
model Post {
  id         Int         @id @default(autoincrement())
  author     User        @relation(fields: [authorId], references: [id])
  authorId   Int         # relation scalar field 關聯 User 的 foreign key
}
```

上面的 `posts`、`author` 是 prisma 專屬產生關聯用法 Prisma Client 依據，database table 中**不存在**的 field；`authorId` 是**存在**於 table 的 forign key 得以關聯 User 和 Post  
![](https://i.imgur.com/S7lL2ID.png =500x)  
spoiler 建立 relation 後 generate 的 Prisma Client 應用例子
可以如下使用：

- 新增 User 同時新增他的 posts
  （user id 不用給是因為有 deafult；post authorId 則自動存為 user id）
  ```javascript
  const userAndPosts = await prisma.user.create({
    data: {
      posts: {
        create: [{ title: 'Prisma Day 2020' }, { title: 'How to write a Prisma schema' }],
      },
    },
  });
  ```
- 查詢 User 可同時取得與他關聯的 posts
  ```javascript
  const getAuthor = await prisma.user.findOne({
    where: {
      id: '20',
    },
    include: {
      posts: true, // authorId == 20 的 post list
    },
  });
  ```
- 或是已存在沒有被關聯的 post，與已存在 User 做關聯
  ```javascript
  const updateAuthor = await prisma.user.update({
    where: {
      id: 20,
    },
    data: {
      posts: {
        connect: {
          id: 4,
        },
      },
    },
  });
  ```

注意 1-1 和 1-n relation 中

- relations 中的 annotated relation field 和 relation scalar 必續同時 required 或是 optional，且 List Model 必為 required
  ```json
    model User {
    id        Int      @id @default(autoincrement())
    posts     Post[]
  }
  model Post {
    id        Int    @id @default(autoincrement())
    author    User?  @relation(fields: [authorId], references: [id])
    authorId  Int?
  }
  ```
- 1-1 forign key 關聯的必須是 unique；1-n 無限制
- `@relation` 只會在其中一邊
  - 一個 Model 同時有對同 Model 的多種關聯會有多個 `@relation`（要 disambiguate：命名區分）
  - 或是 self-relation：可以是 1-1, 1-n, m-n
    - Self-relations on the same model
      ```json
            model User {
        id          Int      @id @default(autoincrement())
        name        String?
        husband     User?    @relation("MarriagePartners")
        wife        User     @relation("MarriagePartners")
        teacher     User?    @relation("TeacherStudents")
        students    User[]   @relation("TeacherStudents")
        followedBy  User[]   @relation("UserFollows")
        following   User[]   @relation("UserFollows")
      }
      ```

### 多對多 m-n relation（Implicit、explicit）

#### Explicit 🔆

```json
model Post {
  id         Int                 @id @default(autoincrement())
  title      String
  categories CategoriesOnPosts[]
}
model Category {
  id    Int                 @id @default(autoincrement())
  name  String
  posts CategoriesOnPosts[]
}
# 表示 MySQL 經過 JOIN, link or pivot 的 table
model CategoriesOnPosts {
  post        Post     @relation(fields: [postId], references: [id])
  postId      Int
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  Int
  # createdAt DateTime @default(now()) 可以加些 meta-information
  @@id([postId, categoryId])
}
```

#### Implicit

- 不用給 relation scalar field，除非是同時多個 self-relations
- 只能在 Model 都是 single `@id` 的情況使用（不可以是組合 id 或是 `@unique`），不符合的話就得選用 explicit 方式
  ![](https://i.imgur.com/Nf4iCRE.png)
  ```json
  # 省略 @relation model Post { id Int @id @default(autoincrement()) categories Category[] } model Category { id Int @id @default(autoincrement()) posts Post[] }
  ```
  ![](https://i.imgur.com/2fSTQl9.png)  
  注意 m-n relation 中
- Implicit：兩邊都要 `@relation` 依據對方

  ```json
    model Post {
    id         Int        @id @default(autoincrement())
    categories Category[] @relation(references: [id])
  }

  model Category {
    id       Int    @id @default(autoincrement())
    name     String
    position Int
    posts    Post[] @relation(references: [id])
  }
  ```

  ![](https://i.imgur.com/AdoDfYh.png)
  如果想自己定義關聯的 table name：

  ```json
    model Post {
    id         Int         @id @default(autoincrement())
    categories Category[]  @relation("MyRelationTable")
  }
  model Category {
    id    Int     @id @default(autoincrement())
    posts Post[]  @relation("MyRelationTable")
  }
  ```

  ![](https://i.imgur.com/rikFBeb.png)

- Explicit：要定義額外的 Model 代表關聯，`@relation` 集中在這 Model，以雙表 id 組合在此 Model 的 id，並且可以額外加上資訊如建立關聯的時間
  ```json
    model Post {
    id         Int                 @id @default(autoincrement())
    title      String
    categories CategoriesOnPosts[]
  }
  model Category {
    id    Int                 @id @default(autoincrement())
    name  String
    posts CategoriesOnPosts[]
  }
  model CategoriesOnPosts {
    post        Post     @relation(fields: [postId], references: [id])
    postId      Int
    category    Category @relation(fields: [categoryId], references: [id])
    categoryId  Int
    createdAt   DateTime @default(now())
    @@id([postId, categoryId])
  }
  ```
  ![](https://i.imgur.com/LTAUsRm.png)
  ![](https://i.imgur.com/V6Ier26.png)
- [如果是 introspection generate prisma client，在那前 MySQL 寫表多對多的關聯可參考這](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#conventions-for-relation-tables-in-implicit-m-n-relations)
  再一個範例：

```json
model AnotherPost {
  authorFirstName String?
  authorLastName  String?
  id              Int          @default(autoincrement()) @id
  title           String?
  AnotherUser     AnotherUser? @relation(fields: [authorFirstName, authorLastName], references: [firstName, lastName])
  @@index([authorFirstName, authorLastName], name: "authorFirstName")
}
model AnotherUser {
  firstName   String?
  id          Int           @default(autoincrement()) @id
  lastName    String?
  AnotherPost AnotherPost[]
  @@unique([firstName, lastName], name: "firstName")
}
model Post {
  authorId Int?
  id       Int     @default(autoincrement()) @id
  title    String?
  User     User?   @relation(fields: [authorId], references: [id]) # 多方關聯父依據
  @@index([authorId], name: "author")
}
model User {
  id   Int     @default(autoincrement()) @id
  name String?
  Post Post[]
}
```

### Self-relations

#### [1-1 Self Relations](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#one-to-one-self-relations)

```json
model User {
  id             Int     @default(autoincrement()) @id
  name           String?
  successorId Int?
  successor   User?   @relation("BlogOwnerHistory", fields: [successorId], references: [id])
  predecessor User?   @relation("BlogOwnerHistory")
}
```

#### [1-n Self Relations](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#one-to-many-self-relations)

```json
model User {
  id       Int      @id @default(autoincrement())
  name     String?
  teacherId Int?
  teacher  User?     @relation("TeacherStudents", fields: [teacherId], references: [id])
  students User[]   @relation("TeacherStudents")
}
```

#### [m-n Self Relations (Implicit)](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#many-to-many-self-relations)

```json
model User {
  id          Int      @id @default(autoincrement())
  name        String?
  followedBy  User[]   @relation("UserFollows", references: [id])
  following   User[]   @relation("UserFollows", references: [id])
}
```

##### Ex.

```json
model User {
  id          Int      @id @default(autoincrement())
  name        String?
  husband     User?    @relation("MarriagePartners")
  wife        User     @relation("MarriagePartners")
  teacher     User?    @relation("TeacherStudents")
  students    User[]   @relation("TeacherStudents")
  followedBy  User[]   @relation("UserFollows")
  following   User[]   @relation("UserFollows")
}
```

### Disambiguating relations

```json
model User {
  id           Int     @id @default(autoincrement())
  name         String?
  writtenPosts Post[]  @relation("WrittenPosts")
  pinnedPost   Post?   @relation("PinnedPost")
}
model Post {
  id          Int     @id @default(autoincrement())
  title       String?
  author      User    @relation("WrittenPosts", fields: [authorId], references: [id])
  authorId    Int
  pinnedBy    User?   @relation(name: "PinnedPost", fields: [pinnedById], references: [id])
  pinnedById  Int?
}
```

## Cascading deletes

得以定義當然除一筆 data 時，怎麼處理與它關聯的其他 table 的資料 ([MySQL](https://www.prisma.io/docs/guides/database-workflows/cascading-deletes/mysql#6-introspect-your-database-with-prisma))
但遺憾目前沒有方法能以 prisma schema 同概念的創建 table
https://github.com/prisma/prisma/discussions/2149

## 定義好後記得要 `npx prisma generate` 才會產生／更新 Prisma Client

# Prisma Client CRUD (Resolver 內)

🔆 重點：[Relation queries](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/relation-queries)，nesting 的寫法

## ☼ Read

### findOne

- return object 或 null
- 要搭配 `where`，且搜尋條件要讓結果必成唯一，例如 data model attribute 有 `@id`, `@unique` 修飾的 field
- [還有 `select`, `include` 可以使用](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud#type)（在其他 crud method 中也是相同用法），例如

  - select: 指定要被 return 的 properties（但好像用不太到）
    ```json
        # schema.prisma
    model User {
      id      Int      @id @default(autoincrement())
      name    String
      posts   Post[]
    }
    model Post {
      id      Int     @id @default(autoincrement())
      author  User    @relation(fields: [userId], references: [id])
      authorId  Int
    }
    ```
    ```json
        const result = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        posts: {
          include: {
            author: true,
          },
        },
      },
    })
    ```
  - include: load relations 的部分，沒有給 true 的話會得到 null

    - `@relation` 類似建立 foreign key 關聯別的 table，teacher 就像把關聯到的部分也綁在這張 table 可以隨時 include 載入得以取用

    ```json
        # schema.prisma
    model Course {
      id             Int              @default(autoincrement()) @id
      title          String
      desc           String?
      teacherId      Int              @map(name: "teacher_id")
      teacher        User             @relation(fields: [teacherId], references: [id])

      @@map(name: "course")
      @@unique([title, teacherId])
    }
    ```

    ```javascript
    const result = await prisma.course.findOne({
      where: { id: courseId },
      include: { teacher: true },
    });
    ```

- 單一 id `where`
  ```javascript
  const result = await prisma.user.findOne({
    where: {
      id: 42,
    },
  });
  ```
- 組合 id `where`

  ```json
    # schema.prisma
  model User {
    firstName String
    lastName  String
    @@id([firstName, lastName])
  }
  ```

  ```javascript
  const result = await prisma.user.findOne({
    where: {
      firstName_lastName: {
        firstName: 'Alice',
        lastName: 'Smith',
      },
    },
  });

  // 或是
  const result = await prisma.user.findOne({
    where: {
      firstName: 'Alice',
      lastName: 'Smith',
    },
  });

  // 或是（這種寫法才有 filter 的最大彈性）
  // 預設就是 AND 所以上兩例不用給 AND，其他還可以用 NOT, OR
  const result = await prisma.user.findOne({
    where: {
      AND: [{ firstName: { equals: 'Alice' } }, { lastName: { equals: 'Smith' } }],
    },
  });
  ```

  先介紹一下 `where` 的用法：作為 filter

### - where

- 依據 property 的型別可接受的 [filter types 不太一樣，請參考這裡](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/filtering)，例如 `lt`, `lte`, `gt`, `gte`, `contains`, `startsWith`, `endsWith`, `equals` 等
  用法簡言之就是：where 條件某個/list(AND/OR/NOT) property 然後給 filter type 和 filter 值，幾乎在任何你想得到的篩選場景都可以插入個 where 來實踐！
  （但寫法真的滿多種，就得靠練習練出 sense 了(?)
  請搭配參閱 [filtering documentation](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/filtering#filter-on-related-records)
- 來試著講看看下面這段是在篩什麼？
  ```javascript
  const result = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: 'Prisma',
          },
        },
        {
          title: {
            contains: 'databases',
          },
        },
      ],
      NOT: {
        title: {
          contains: 'SQL',
        },
      },
      user: {
        NOT: {
          email: {
            contains: 'meeting',
          },
        },
      },
    },
    include: {
      user: true,
    },
  });
  ```
  上面代表：取得所有 title 包含 "Prisma" 或 "databases" 但不包含 "SQL"、且關聯的 user 的 email 不包含 "meeting" 的所有 post list
- 關聯 record 的 filter
  ```javascript
  const result = await prisma.post.findMany({
    where: {
      user: {
        email: {
          equals: 'sarah@prisma.io',
        },
      },
    },
  });
  ```
- `where` 除了 `AND`, `OR`, `NOT`，也可以搭配 `some`, `every`, `none` 來做條件
  ```javascript
  const result = await prisma.user.findMany({
    where: {
      post: {
        every: {
          published: true,
        },
        some: {
          content: {
            contains: 'Prisma',
          },
        },
      },
    },
  });
  ```
  上面代表：取得所有 post 都 published、且其中有內容含有 "Prisma" 的 user list
- `include` 中使用 `where`
  ```javascript
  const result = await prisma.user.findMany({
    where: {
      Post: {
        some: {
          published: false,
        },
      },
    },
    include: {
      Post: {
        where: {
          published: false,
        },
      },
    },
  });
  ```
  上面代表：取得所有至少一篇 post 沒有 publish 的，且 include 所有 publish 的 post list 的 user 的 list
- `select` 中使用
  ```javascript
  const result = await prisma.user.findMany({
    where: {
      email: {
        contains: 'prisma.io',
      },
    },
    select: {
      posts: {
        where: {
          published: false,
        },
        select: {
          title: true,
        },
      },
    },
  });
  ```
  上面代表：取得所有 email 含有 "prisma.io" 的 user 的符合未 publish 的 post list
  其實換個角度以 prisma.post.findMany 開頭也可以寫出同概念的 query
  ```javascript
  const result = await prisma.post.findMany({
    where: {
      published: false,
      user: {
        email: {
          contains: 'prisma.io',
        },
      },
    },
    select: {
      title: true,
    },
  });
  ```

### findMany

- return list
- [除了 `select`, `include` 還有得以 paginate, filter, 和 order 的用法](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud#type-1)
  ```javascript
  const result = await prisma.user.findMany({
    where: {
      email: {
        endsWith: 'prisma.io',
      },
    },
  });
  ```
  ```javascript
  const result = await prisma.post.findMany({
    where: {
      date_created: {
        gte: new Date('2020-03-19T14:21:00+0200') /* Includes time offset for UTC */,
      },
    },
  });
  ```
  - 排序：`orderBy` field `asc`（小到大） 或 `desc`（大到小）
  - `take` 取 list 前 n 筆或 `cursor` 後 n 筆
  - `skip` 跳前過 n 筆
  - `cursor` 指一個 list 的位置，通常是 id 或 unique value（補範例）

### - distinct

```json
# schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["distinct"] # 要多這行設定才可使用
}
```

```javascript
const result = await prisma.user.findMany({
  distinct: ['birthday'],
});
```

## ☼ Create

### create

- 必須給 `data`（通常就是定義的 input object 那包）
  ```javascript
  const user = await prisma.user.create({
    data: { email: 'alice@prisma.io' },
  });
  ```
  - 所以當 schema 定義傳入的是 data: XXXInput 時，resolver 第二個參數得的 data 可直接塞給 create
- return object，一樣可以 `select`、`include`
- 關聯的 type（別張 table）可以同時一起新增
- 範例
  - 一對多時的同時新增：假設新增 user 同時新增他關聯的多個 post
    ```javascript
    const user = await prisma.user.create({
      data: {
        email: 'alice@prisma.io',
        posts: {
          create: [{ title: 'This is my first post' }, { title: 'Here comes a second post' }],
        },
      },
    });
    ```
  - 一對多時的同時新增：新增已存在的 user post
    ```javascript
    const user = await prisma.post.create({
      data: {
        title: 'Hello World',
        author: {
          connect: { email: 'alice@prisma.io' },
        },
      },
    });
    ```
    `connect` 的 property 一樣必須是 id 或 unique，若找無 query 會失敗，想避免 connect 這種失敗可以使用 `connectOrCreate`（後面補充）
    上面 code 也可以改以 user update 的角度寫：
    ```javascript
    const user = await prisma.user.update({
      where: { email: 'alice@prisma.io' },
      data: {
        posts: {
          create: { title: 'Hello World' },
        },
      },
    });
    ```

### - connectOrCreate

它跟 distinct 一樣是 preview feature，必須先如下新增（但我們應該也不太需要使用到）

```json
# schema.prisma
generator client {
  provider             = "prisma-client-js"
  experimentalFeatures = ["connectOrCreate"] # 要多這行設定才可使用
}
```

```javascript
const user = await prisma.post.create({
  data: {
    title: 'Hello World',
    author: {
      connectOrCreate: {
        // connectOrCreate is a preview feature and must be enabled!
        where: { email: 'alice@prisma.io' },
        create: { email: 'alice@prisma.io' },
      },
    },
  },
});
```

## ☼ Update

### update

大致和 create 用法相同。update 可同時新增/刪除/更新關聯

- 必須給 `data`（要更新的部分，也是通常 input object 的那包）
- 必須要給 `where` 篩 id 或 unique
  ```javascript
  const user = await prisma.user.update({
    where: { id: 1 },
    data: { email: 'alice@prisma.io' },
  });
  ```
- return object 或 RecordNotFound failed，一樣可以 `select`、`include`
- 關聯的 type（別張 table）可以同時一起更新
- 範例
  ```javascript
  const user = await prisma.user.update({
    where: { email: 'alice@prisma.io' },
    data: {
      posts: {
        update: [
          {
            data: { published: true },
            where: { id: 32 },
          },
          {
            data: { published: true },
            where: { id: 23 },
          },
        ],
      },
    },
  });
  ```
  也可以用 `upsert` 可以更新關聯或 create 新的（Insert 或 Update），return object
  單筆
  ```javascript
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: { email: 'alice@prisma.io' },
    create: { email: 'alice@prisma.io' },
  });
  ```
  關聯多筆
  ```javascript
  const user = await prisma.user.update({
    where: { email: 'alice@prisma.io' },
    data: {
      posts: {
        upsert: [
          {
            create: { title: 'This is my first post' },
            update: { title: 'This is my first post' },
            where: { id: 32 },
          },
          {
            create: { title: 'This is mt second post' },
            update: { title: 'This is mt second post' },
            where: { id: 23 },
          },
        ],
      },
    },
  });
  ```
  ```javascript
  const user = await prisma.user.update({
    where: { email: 'alice@prisma.io' },
    data: {
      posts: {
        delete: [{ id: 34 }, { id: 36 }],
      },
    },
  });
  ```
  還有 disconnect 關聯的用法
  ```javascript
  const user = await prisma.user.update({
    where: { email: 'alice@prisma.io' },
    data: {
      posts: {
        disconnect: [{ id: 44 }, { id: 46 }],
      },
    },
  });
  ```
  重新指定關聯的 posts
  ```javascript
  const user = await prisma.user.update({
    where: { email: 'alice@prisma.io' },
    data: {
      posts: {
        set: [{ id: 32 }, { id: 42 }],
      },
    },
  });
  ```

### updateMany

- 必須要給 `data`（要更新的部分，也是通常 input object 的那包）
- 批量 update 的部分 `where` 是 optional，沒給是指全部
- return 有 count 的 BatchPayload object

## ☼ Delete

### delete

- 必須要給 `where` 篩 id 或 unique
  ```javascript
  const user = await prisma.user.delete({
    where: { id: 1 },
  });
  ```
- return deleted object，一樣可以 `select`、`include`

### deleteMany

- `where` 是 optional，沒給是指全部
- return 有 count 的 BatchPayload object

## ☼ count

- return 有 count 的 BatchPayload object
- 可以給 [`where`, `orderBy`, `skip`, `after`, `before`, `first`, `last`](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud#reference-8)

```javascript
const result = await prisma.user.count({
  where: {
    post: {
      some: {
        published: true,
      },
    },
  },
});
```

# Prisma Client Pagination

簡介兩種分頁模式

## Offset pagination

利用 `skip`, `take` 迅速選取到指定的頁面資料範圍（MySQL 中利用 OFFSET）
![](https://i.imgur.com/GiMkJcJ.png)

```javascript
// 假設一頁 20 筆，取第 11 頁（搭配 filter, sort）
const results = prisma.post.findMany({
  skip: 200,
  take: 20,
  where: {
    title: {
      contains: 'Prisma',
    },
  },
  orderBy: {
    title: 'desc',
  },
});
```

- Pros：且適用任意 sort (orderBy) 後的“不變”的結果（期間有增刪值可能會影響到）
- Cons：選越後面的筆數越耗能（假設 skip 200,000），因為它一樣會從起始往後掃到你要的那段
  - 但一般來說像是個人部落這種的資料量不大的都還可以適用

## Cursor-based pagination

在經過 unique 且有序列的 column （EX. id 或 timestamp）排序過後的結果，取得指定點 `cursor` 前／後 limited 個數 `take` 的選取範圍結果
可以把 cursor 當書籤的概念
（MySQL not use OFFSET，而是查詢大於 cursor 的值）
![](https://i.imgur.com/tVLKzmy.png)

```javascript
// 上圖為例
const firstQueryResults = prisma.post.findMany({
  take: 4,
  where: {
    title: {
      contains: 'Prisma', // optional
    },
  },
  orderBy: {
    id: 'asc',
  },
});
const lastPostInResults = firstQueryResults[3];
const myCursor = lastPostInResults.id; // 29
```

呈上，指定從 cursor 位置開始取 4 個

```javascript
const secondQueryResults = prisma.post.findMany({
  take: 4, // 取後 4 筆，要改取前的話給負數即可
  skip: 1, // 起始包含 cursor（上次選取的最後一個），會 skip 掉
  cursor: {
    id: myCursor, // 29
  },
  where: {
    title: {
      contains: 'Prisma',
    },
  },
  orderBy: {
    id: 'asc',
  },
});
const lastPostInResults = secondQueryResults[3];
const myCursor = lastPostInResults.id; // 52
```

![](https://i.imgur.com/UISj2lZ.png)

- Pros：scales（增刪值不影響）
- Cons：必須要排序成唯一的序列（有點抽象，但記得要拿 unique 的值來 orderBy 過就是了）。且沒辦法直接跳到指定頁，只能靠 cursor ，而 cursor 是不可預測的。
- 適用場景：Infinite scroll、一次批次分頁完所有資料

# Resources

- [Prisma](https://www.prisma.io/docs/getting-started/quickstart-typescript) 🔆
- [SQL 語法教學、Constraint 限制可以參考這邊](https://www.fooish.com/sql/constraints.html)
