---
title: 'Apollo Server 入門篇'
path: blog/20200910
tags: [apollo]
date: 2020-09-10
excerpt: 快速複習去年分享的 GraphQL Schema 和 Client query 語法，並簡介如何以 Apollo Server 建立 GraphQL Server。
---

[HackMD](https://hackmd.io/mOTKzMwoRyaDvP2NkyV6MQ?view)

# GraphQL Server

## 先前開發 Server 的演變概要：[GraphQL Yoga](https://github.com/prisma-labs/graphql-yoga) 🔜 [Apollo Server](https://www.apollographql.com/docs/apollo-server/)

- 社群大小、活躍度、使用者多寡
- 考量未來可能會有使用 Federation 的場景 [Federation 可以參考這篇](https://chihching.net/intro-graphql-federation-zh-hant)
  - 後端想要不同 microservice 處理他們各自的邏輯，各自維護負責範圍的 Schema

## GraphQL Schema

定義 GraphQL API 的輪廓及規範，當與 Resolver 處理出的資料不符合 Type 就會噴錯（但 Null 可以通過）  
快速複習常用的定義 Schema 用法：

- Object type

  - 包含 fields 和 field 的 type

    ```graphql
    #################### Type ###################
    type User {
      lastName: String
      firstName: String
      birthday: Date
      createdAt: Date
      updatedAt: Date
    }

    #################### Root ###################
    type Query {
      user(id: ID!): User
    }

    type Mutation {
      createUser(data: UserCreateInput!): User
    }
    ```

  - Query、Mutation、Subscription 也是，但同時也是 Schema 的 entry point

- Input Object Type
  跟 Object Type 幾乎一樣的還有 Input Object Type，但是一個是傳入 Argument 作為 Input（只會在左邊） ，一個是用於資料索取展示
  - 推薦每支 mutation 都新增一支專屬的 input object type，習慣命名 xxxInput
- Scalar Type (Int, Float, String, Boolean, ID, Enum)
  - Enum
    ```graphql
    enum Sort {
      asc
      desc
    }
    ```
  - 其他例如 Date、Timestamp 都要另外自定義
- Non-null Syntax
  - type 右邊加上 `!` 保證不為空
  - 一旦修改 Not-Null field 就會是 Breaking Change，建議剛開始設計時，除了 ID 以外的欄位都不要加上
- Array Type Syntax
  - 用 `[]` 包起來就是 array type
  - 例如：`notIn: [Int]`、`teachers: [User]`、`courses: [Course]`
  - 有無加上 Non-null Syntax 舉例：
    - `teachers: [User]`
    - `teachers: [User!]`
    - `teachers: [User!]!`
- 不管是 Object Type 或 Scalar Type 都能使用 Argument
- 註解：
  - 單行出現在文件 `"`
  - 單行不出現在文件 `#`
  - 多行出現在文件 `"""`

## 組成

### 1. Create an instance of ApolloServer

- `new ApolloServer({ typeDefs, resolvers }` 最基本要傳 typeDefs、 resolvers，但我們還需要透過 context 來放 prisma client：

  ```javascript
  // server.js
  const { ApolloServer } = require('apollo-server');
  const dotenv = require('dotenv/config');
  const { createContext } = require('./context');
  const { typeDefs } = require('./typeDefs');
  const { resolvers } = require('./resolvers');

  const server = new ApolloServer({ typeDefs, resolvers, context: createContext });
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
  ```

  - 起起來的預設 port 就是 GraphQL Playground，可以在這邊確認文件、試打 api 符不符合自己的預期

- `context` 主要都是放 request/response、ORM、處理認證等相關的東西，得以在每個 resolver 使用（又有點像 middleware）

  ```javascript
  // context.js
  const { PrismaClient } = require('@prisma/client');
  const jwt = require('jsonwebtoken');
  const prisma = new PrismaClient();

  const parseCookie = (str = '') =>
    str
      ? str
          .split(';')
          .map((v) => v.split('='))
          .reduce((acc, v) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
            return acc;
          }, {})
      : {};

  async function createContext({ req, res }) {
    const cookies = parseCookie(req.headers.cookie);
    const { accessToken, refreshToken } = cookies;
    const context = {
      request: req,
      response: res,
      prisma,
    };
    let decoded = await jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      if (refreshToken) {
        context.currentUser = decoded || null;
      }
    }
    return context;
  }

  module.exports = {
    createContext,
  };
  ```

- `typeDefs` 定義 Schema (Query, Mutation, Type, Input object ...)
  - Query, Mutation 其實就是定義 field 或 function name 被 call 時的 ==input, output 格式==，格式就是預設的 scalar type 或是自己定義的 type, input object, enum...等等，真正邏輯實作在與其 name 對應的 resolver
- `resolvers` 依據定義的 Query, Mutation Schema 的資料操作、邏輯等實作（名稱要對上）
- [typeDefs, resolvers 拆分參考](https://stackoverflow.com/a/60747952/7849574)
  typeDefs 可以給陣列
  resolvers 可以在另外解構合併成一大包

### 2. typeDefs

- 透過 `apollo-server` 的 gql 寫 graph schema，一個 typeDefs 物件裡通常一定會有 type Query 和 type Mutation，裡面再定義要經過 resolver 處理的 field 或 function 的名稱、輸入型別、輸出型別（詳細寫法請參閱 [GraphQL 官方文件](https://graphql.org/learn/)）
- 在定義 type 時，field name 要對照 DB 實際的 Table column name ，依我們 prisma 映射 DB 的專案可以直接參照檔案 `schema.prisma`（我們 MySQL DB 中的 Tables 就是下 `npx prisma migrate save --experimental`、`npx prisma migrate up --experimental`，然後依據這檔案建立/修改的）
  舉例：

  1.  schema.prisma 有定義一個會產生 user table 的 data model

      ```json
            model User {
        id             Int              @default(autoincrement()) @id
        email          String           @unique
        password       String
        lastName       String           @map(name: "last_name")
        firstName      String           @map(name: "first_name")
        nickName       String           @map(name: "nick_name")
        birthday       DateTime?
        headThumb      String?          @map(name: "head_thumb")
        desc           String?
        notified       Boolean          @default(false)
        activated      Boolean          @default(false)
        facebookId     String?          @map(name: "facebook_id")
        googleId       String?          @map(name: "google_id")
        createdAt      DateTime         @map(name: "created_at")  @default(now())
        updatedAt      DateTime?        @map(name: "updated_at")  @updatedAt
        courses        Course[]

        @@map(name: "user")
      }
      ```

  2.  然後在 typeDefs 定義一個 user 的 crud 輪廓，依據有無資料異動分到 type Query（無資料異動，通常 camelCase 名詞）/ type Mutation（有資料異動，通常 camelCase 動詞+名詞）底下。宣告 Type 類型的名稱習慣 PascalCase 名詞。

      - 當要傳很多值的話，通常會宣告一個傳 input object type 的參數（負責新增的 input 傳的參數我們統一叫 `data` 好了），會依據不同操作定義不同的 `input XxxxInput`，當中字段可能就會包含 Create/Update/Update...。例如：`signUp(data: UserCreateInput!): User`
        這些傳的參數很大包的話通常在 client query 就會宣告變數、input object 傳的整包另外被放在 Query Variables（playground 範例）
      - 另外提醒適當的註解有助於更完整 Schema 及文件的說明，可以多多利用

        ````javascript
                const { gql } = require('apollo-server');
        const typeDefs = gql`
        ##################### Common 共用 ###################
        scalar DateTime
        scalar Date

              enum Gender {
                "Male"
                M
                "Female"
                F
                "TRANSGENDER"
                T
              }

              enum Sort {
                asc
                desc
              }

              """
              共用表格filter保留字參數
              """
              input TableStringFilterInput {
                ne: String
                eq: String
                le: String
                lt: String
                ge: String
                gt: String
                contains: String
                notContains: String
                between: [String]
                beginsWith: String
              }
              input TableIntFilterInput {
                equals: Int
                not: Int
                in: Int
                notIn: [Int]
                lt: Int
                lte: Int
                ge: Int
                gte: Int
              }

              ##################### User 使用者 ###################
              """
              建立使用者參數
              """
              input UserCreateInput {
                email: String!
                password: String!
                lastName: String!
                firstName: String!
                nickName: String!
                birthday: DateTime!
                headThumb: String
                desc: String
                notified: Boolean
                activated: Boolean
                facebookId: String
                googleId: String
                updatedAt: DateTime
                courseIds: String
              }

              """
              可更新使用者參數
              """
              input UserUpdateInput {
                lastName: String
                firstName: String
                nickName: String
                headThumb: String
                desc: String
                notified: Boolean
                activated: Boolean
                facebookId: String
                googleId: String
              }

              """
              使用者欄位
              """
              type User {
                id: ID
                email: String
                lastName: String
                firstName: String
                nickName: String
                birthday: DateTime
                headThumb: String
                desc: String
                notified: Boolean
                activated: Boolean
                facebookId: String
                googleId: String
                createdAt: DateTime
                updatedAt: DateTime
                courseIds: String
              }

              """
              篩選User參數
              """
              input UserFilterKey {
                email: TableStringFilterInput
                lastName: TableStringFilterInput
                firstName: TableStringFilterInput
                nickName: TableStringFilterInput
                gender: TableStringFilterInput
              }

              """
              排序User參數
              """
              input UserOrderByInput {
                email: Sort
                firstName: Sort
                birthday: Sort
                createdAt: Sort
                updatedAt: Sort
              }

              ##################### Root Object ###################

              type Query {
                currentUser: User
                users(filter: UserFilterKey, skip: Int, take: Int, orderBy: UserOrderByInput): [User!]
                signIn(email: String!, password: String!): User
              }

              type Mutation {
                signUp(data: UserCreateInput!): User
                updateUser(userId: Int!, data: UserUpdateInput!): User
                deleteUser(userId: Int!): Boolean
              }
            `;

            module.exports = {
              typeDefs,
            };
            ```

        順便看一下在 playground 打 signUp 怎麼操作
        ![](https://i.imgur.com/PCt8w0Y.png)
        ````

### 3. resolvers

- 上次主要提到的，相當於 GraphQL query handler、controller 的概念，定義 GraphQL query response 的 functions 集合，這每個 function 都是 schema 的 type 或 field 的 resolver
- 看個範例

  ```javascript
  // resolvers.js
  const path = require('path');
  const { DateTimeResolver, DateResolver } = require('graphql-scalars');
  const bcrypt = require('bcrypt');
  const crypto = require('crypto');
  const jwt = require('jsonwebtoken');
  const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-core');
  const { combineResolvers, skip } = require('graphql-resolvers');

  const createTokens = (user) => {
    const refreshToken = jwt.sign({ userId: user.id, count: user.count }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });
    const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15min',
    });
    return { refreshToken, accessToken };
  };

  const isAuthenticated = async (parent, args, { prisma, currentUser, request }) => {
    if (currentUser) {
      const user = await prisma.user.findOne({
        where: {
          id: Number(currentUser.userId),
        },
      });
      if (user) {
        return skip;
      }
    }
    return new AuthenticationError('未認證無法存取，請先登入');
  };

  const resolvers = {
    DateTime: DateTimeResolver,
    Date: DateResolver,
    Query: {
      currentUser: async (parent, args, { prisma, currentUser }) => {
        if (!currentUser || !currentUser.userId) {
          throw new AuthenticationError('當前未登入！請重新登錄');
        }
        return await prisma.user.findOne({ where: { id: currentUser.userId } });
      },
      users: combineResolvers(
        isAuthenticated,
        async (parent, { filter, skip, take, orderBy }, { prisma }) =>
          await prisma.user.findMany({ where: filter || {}, skip, take, orderBy })
      ),
      signIn: async (parent, { email, password }, { prisma, response, request }) => {
        const user = await prisma.user.findOne({ where: { email } });
        if (!user || !bcrypt.compareSync(password, user.password)) {
          throw new AuthenticationError('登入失敗：帳號或密碼錯誤');
        }
        const { accessToken, refreshToken } = createTokens(user);
        response.cookie('refreshToken', refreshToken, { httpOnly: true });
        response.cookie('accessToken', accessToken, { httpOnly: true });
        return user;
      },
    },
    Mutation: {
      signUp: async (parent, { data }, { prisma }) => {
        if (!!(await prisma.user.findOne({ where: { email: data.email } }))) {
          throw new UserInputError('已註冊，請直接登入');
        }
        data.password = bcrypt.hashSync(data.password, 12);
        return await prisma.user.create({
          data,
        });
      },
      updateUser: async (parent, { userId, data }, { prisma }) => {
        return await prisma.user.update({
          where: { id: userId },
          data,
        });
      },
      deleteUser: async (parent, { userId }, { prisma }, info) => {
        await prisma.user.delete({ where: { id: userId } });
        return true;
      },
    },
  };

  module.exports = {
    resolvers,
  };
  ```

- 之後想要做身份認證的話，可以使用 `graphql-resolvers`，用 combineResolvers 把多個 resolver 包起（應該是種 Higher order functions?）會由左至右順序執行(前面 resolver 要 return skip，最後一個仍要回傳 Schema 定義的回傳型別 data)
- Prisma Client 就是在 resolver 裡使用的操作資料管道（必須在前面定義好 Schema 下 `npx prisma generate` 才會更新得以正常使用）[詳細 CRUD 說明請參閱 Prisma 官方文件](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud)

## GraphQL Pagination Schema

> Use Nodes when you have a finite list to use but don’t need the cursors for pagination. Use Edges when you have large list and you need to know the cursors to paginate

- [GraphQL Pagination best practices: Using Edges vs Nodes in Connections](https://medium.com/javascript-in-plain-english/graphql-pagination-using-edges-vs-nodes-in-connections-f2ddb8edffa0)
- [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
- https://medium.com/@smallbee/super-fast-offset-pagination-with-prisma2-21db93e5cc90

## Resources

- [GraphQL](https://graphql.org/learn/) 🔆
- [2019 iT 邦幫忙鐵人賽 - Think in GraphQL 系列](https://ithelp.ithome.com.tw/users/20111997/ironman/1878)
- [Code-first vs. schema-first development in GraphQL](https://blog.logrocket.com/code-first-vs-schema-first-development-graphql/)
- [Shopify Tutorial: Designing a GraphQL API](https://github.com/Shopify/graphql-design-tutorial/blob/master/TUTORIAL.md)
- [N+1 Problem → GraphQL Design: 使用 DataLoader 提升效能 !](https://ithelp.ithome.com.tw/articles/10207606)
  > [Github singple_backend](https://github.com/Tyler-ntut/singple_backend)

---

## Workshop

Clone → https://gitlab.baifu-tech.net/f2e_tw/serverworkshop

- Define prisma schema and create tables
- Define graphql schema, api entry point, and implement the resolvers
- Add [Filter](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/filtering) input type
- Add Sort input type
- Self Relation examples (self-relations branch)
- Spilt TypeDefs & Resolvers (spilt-files-example)
