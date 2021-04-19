---
title: 'GraphQL & Apollo Client'
path: blog/20190907
tags: [apollo]
date: 2019-09-07
excerpt: 簡單介紹 React Client 端如何用 Apollo 對 GraphQL Server 做資料存取操作。
---

## RESTful

- 資源相依：一個 URL 只能獲取特定資源，結構鬆散問題導致多條件查詢得創造多個 URL
- 回傳的內容格式無法預期
- 沒有文件（但可用 [Stoplight](https://stoplight.io/docs/) 去做 API 文件另外維護更新）
- 在 React 內資料放在 Redux
- 例：`GET /resource/{:id}/relation/{:relation_id}`

## [GraphQL](https://graphql.cn/)

![](https://i.imgur.com/3Vp0YJx.png)

> 一種用於 API 的查詢語言，主要使用於應用服務之間的溝通（尤其是前後端）
> [Learn GraphQL](https://graphql.cn/learn/queries/)
> :::warning
> **GraphQL Server**
> 架構： Schema 定義 GraphQL API 的輪廓及規範
> 行為： Resolver 負責資料取得的實作（Query，Mutation⋯⋯）
> :::

1. 行動裝置普及
2. 資料邏輯複雜
3. Micro service 崛起

![](https://i.imgur.com/NKDVcWM.png)

優點

- 可以通過一次請求就獲取所需的所有數據
- 程式即文檔
- 一些特性：
  - 宣告式 (Declarative) 資料索取
  - Scalar type 強型別：Int, Float, String, Boolean, ID
- 原先為 fb 內部使用，現有知名使用站 Github、Reddit、Shopify、Twitter
- 很多線上 Playground
  - [GraphQL Playground](https://www.graphqlbin.com/v2/mqZgc5)
  - [GraphiQL](https://lucasconstantino.github.io/graphiql-online/)
- [GraphQLHub](https://www.graphqlhub.com/) 一些大公司的公開 GraphQL api 可參考

缺點

- 容易不小心陷入 RESTful API 的設計思維，埋下更多技術債
- 預設 Error Handling 的 GraphQL errors 全部都是 runtime errors（資料拿不到）

## RESTful vs GraphQL

|            RESTful             |           GraphQL           |
| :----------------------------: | :-------------------------: |
|      通常好幾個 Endpoint       |     單一 Endpoint 入口      |
| Request 次數多（橫跨多資源時） | Request 次數少（大部份時候) |
|      API 回你什麼就是什麼      |     回傳資料相對可預期      |
|          文件維護麻煩          |    可做到 Schema 即文件     |

## [Apollo Client](https://ithelp.ithome.com.tw/articles/10209136)

- Apollo Client 是 JavaScript 應用程式的 **狀態管理庫**，可存取 GraphQL server 資料，也有 cache 機制。
  不用 redux 繁瑣的 action, reducer, dispatch 就能讓全局管理 store 變得簡單直白，並專注在規劃所需要的數據。
  > Intelligent `caching` and declarative approach to data `fetching` can help you iterate faster while writing less code.
- `Apollo` 是社群驅動開發的 GraphQL client，容易理解、可拓展性強，功能強大，可以在主流開發平臺上面使用。
  - 補：`Relay` 則是由 Facebook 開發的開源的 GraphQL Client，功能豐富並且做了很多效能優化，由於是一個大而全的庫，學習難度比較大。
- 想引入現有 React & Redux 專案的話可參考 [Graph + React + Redux](https://s3.amazonaws.com/apollo-docs-1.x/redux.html)

### Why Apollo Client?

1. 聲明式存取資料
2. 內建 caching 機制
3. 強大社群開發

#### Declarative data fetching - `useQuery` /`useLazyQuery` hook

> Retrieving your data, tracking loading and error states, and updating your UI.[color=pink]

**[useQuery](https://www.apollographql.com/docs/react/essentials/queries/#options)** Apollo Client 會在 React mounts 和 renders 自動 query

```javascript
function Feed() {
  const { loading, error, data } = useQuery(GET_DOGS);
  if (error) return <Error />;
  if (loading || !data) return <Fetching />;

  return <DogList dogs={data.dogs} />;
}
```

- 用 render props 寫法如下

  ```javascript
  const Feed = () => (
    <Query query={GET_DOGS}>
      {({ loading, error, data }) => {
        if (error) return <Error />;
        if (loading || !data) return <Fetching />;

        return <DogList dogs={data.dogs} />;
      }}
    </Query>
  );
  ```

hooks 寫法較 render props 寫法乾淨易讀

如果想要藉由 event 觸發 query (ex. onClick) 則可以用 **useLazyQuery**

```javascript
import React from 'react';
import { useLazyQuery } from '@apollo/react-hooks';

function DelayedQuery() {
  const [dog, setDog] = useState(null);
  const [getDog, { loading, data }] = useLazyQuery(GET_DOG_PHOTO);

  if (loading) return <p>Loading ...</p>;

  if (data && data.dog) {
    setDog(data.dog);
  }

  return (
    <div>
      {dog && <img src={dog.displayImage} />}
      <button onClick={() => getDog({ variables: { breed: 'bulldog' } })}>Click me!</button>
    </div>
  );
}
```

#### Zero-config caching

> Just by setting up Apollo Client, you get an intelligent cache out of the box with no additional configuration required.[color=pink]

- [`cacheRedirects`](https://xbuba.com/questions/52927310) 告訴 Apollo 如何從其他查詢訪問已經在緩存中的數據

#### Combine local & remote data

> You can add client-side only fields to your remote data seamlessly and query them from your components.[color=pink]

- [Local state management](https://www.apollographql.com/docs/react/essentials/local-state/)

```javascript=
const GET_DOG = gql`
  query GetDogByBreed($breed: String!) {
    dog(breed: $breed) {
      images {
        url
        id
        isLiked @client
      }
    }
  }
`;
```

#### Vibrant ecosystem

## Learn Apollo Client (React hooks)

- gql query: 其實就是選取 Object 的 field 來獲取資料
  - The `operation type` is either query, mutation, or subscription.
  - The `operation name` is a meaningful and explicit name for your operation.
    - 增加可讀性、表達性
    - 若一次執行多筆 operation， Query Name 有助於區分各個 operation
    - debug 或是效能追蹤才好找
  - All `declared variables` must be either scalars(Int, Float, String, Boolean, ID), enums, or input object types.
  - ![](https://i.imgur.com/pCmNYXy.png)
  - ![](https://i.imgur.com/bDie7WZ.png)
  - 需注意：**Input Object Type** 與 **Object Type** 完全不同，一個是傳入 Argument 作為 Input ，一個是用於資料索取展示
- ### [Queries](https://graphql.org/learn/queries/) - useQuery hooks

  - [Query Example](https://graphql.org/learn/queries/#using-variables-inside-fragments)
  - [`useQuery`](https://www.apollographql.com/docs/react/essentials/queries/#options) 返回 result object，包含 loading, error, data…
  - Polling 可定時請求

    - `pollInterval`

    ```javascript
    function DogPhoto({ breed }) {
      const { loading, error, data } = useQuery(GET_DOG_PHOTO, {
        variables: { breed },
        skip: !breed,
        pollInterval: 500,
      });

      if (loading) return null;
      if (error) return `Error! ${error}`;

      return <img src={data.dog.displayImage} style={{ height: 100, width: 100 }} />;
    }
    ```

    ```javascript
    const DogPhoto = ({ breed }) => (
      <Query query={GET_DOG_PHOTO} variables={{ breed }} skip={!breed} pollInterval={500}>
        {({ loading, error, data }) => {
          if (loading) return null;
          if (error) return `Error! ${error}`;

          return <img src={data.dog.displayImage} style={{ height: 100, width: 100 }} />;
        }}
      </Query>
    );
    ```

  - Refetching 可執行前次查詢

    - `refetch` 可選擇地代新 variables
    - 但 loading 第一次取得 data 後無用，可藉由 useQuery 第二個參數給 `notifyOnNetworkStatusChange: true` 設定。`networkStatus`會是 4

    ```javascript
    function DogPhoto({ breed }) {
      const { loading, error, data, refetch, networkStatus } = useQuery(GET_DOG_PHOTO, {
        variables: { breed },
        skip: !breed,
        notifyOnNetworkStatusChange: true,
      });

      if ((networkStatus **= 4)) return 'Refetching!';
      if (loading) return null;
      if (error) return `Error! ${error}`;

      return (
        <div>
          <img src={data.dog.displayImage} style={{ height: 100, width: 100 }} />
          <button onClick={() => refetch()}>Refetch!</button>
        </div>
      );
    }
    ```

- ### [useMutation](https://www.apollographql.com/docs/react/essentials/mutations/) - useMutation hooks

  - Mutation = RESTful 的 `POST`/`PUT`/`PATCH`
  - [Mutation Example](https://graphql.org/learn/queries/#mutations)
  - [`useMutation`](https://www.apollographql.com/docs/react/essentials/mutations/#options) 返回陣列第一個參數為 mutate function，第二個是 result object，也包含 loading, error, data...
  - ```javascript
    import gql from 'graphql-tag';
    import { useMutation } from '@apollo/react-hooks';

    const ADD_TODO = gql`
      mutation AddTodo($type: String!) {
        addTodo(type: $type) {
          id
          type
        }
      }
    `;

    function AddTodo() {
      let input;
      const [addTodo, { data }] = useMutation(ADD_TODO);

      return (
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTodo({ variables: { type: input.value } });
              input.value = '';
            }}
          >
            <input
              ref={(node) => {
                input = node;
              }}
            />
            <button type="submit">Add Todo</button>
          </form>
        </div>
      );
    }
    ```

  - [Updating the cache](https://www.apollographql.com/docs/react/essentials/mutations/#updating-the-cache)
    _ 可以做增刪改後的 cache 變更
    _ 看範例程式
    ![](https://i.imgur.com/YgYngRP.png)
    _ apollo graphql 的提取策略是緩存優先，若需要最新數據的查詢，禁止使用 apollo 緩存，則可以配置 `{ fetchPolicy: "network-only" }`
    其他還有
    _ cache-first → (預設)優先找 cache ，找不到才抓
    _ cache-and-network → 先從 cache 顯示，同時抓更新資料
    _ network-only → 無視 cache，永遠從 API 抓
    _ cache-only → 永遠從 cache 拿，拿不到就噴 error
    _ no-cache → 永遠從 API 抓，而且不寫進 cache
  - [Basic optimistic UI](https://www.apollographql.com/docs/react/features/optimistic-ui/#basic-optimistic-ui)
    - **update** 會在 mutation response 回來時被觸發，而 **optimisticRespons** 是在 mutation 前先造假 response update 一次，讓資料先從 cache 中消失

## Packages

- hooks 版和 render prop components 版所需要 npm 的東西不同
  - hooks `npm install @apollo/react-hooks`
    - will give you the greatest bundle size savings
  - render prop `npm install @apollo/react-components`
  - HOC `npm install @apollo/react-hoc`
  - 以上 3 React Apollo paradigms 都要 `npm install react-apollo`
- `npm install apollo-boost` [設定 option](https://www.apollographql.com/docs/react/essentials/get-started/#configuration-options)
  - apollo-boost 包含了下面設置 Apollo Client 所需的核心包
    也可以客制自行選擇安裝單獨的包
    _ apollo-client：Apollo 的所有操作都從這裡開始，提供了豐富的 API
    _ apollo-cache-inmemory: Apollo 推薦的 Cache
    _ apollo-link-http: Apollo 用來和 Server 端通訊
    _ apollo-link-error: Apollo Client 錯誤處理
    _ apollo-link-state: 本地狀態管理
    _ graphql-tag: 提供 gql 方法，方便定義 queries 和 mutations
- `npm install graphql` 解析 GraphQL queries
- ~~react-apollo: 連線 Apollo 和 React 的 UI 元件~~

目前練習覺得 react hooks 要 graphql 需要的有
`npm install @apollo/react-hooks graphql-tag apollo-client apollo-cache-inmemory`
看 graphql server 情形 `npm install apollo-link-http apollo-link-context`

## Reference

- 範例程式 Youtube [Classed](https://www.youtube.com/channel/UC2-slOJImuSc20Drbf88qvg/playlists) 教學
- [Apollo Client, now with React Hooks](https://blog.apollographql.com/apollo-client-now-with-react-hooks-676d116eeae2)
- iT 邦幫忙 [graphQL 基礎實踐](https://juejin.im/post/5b5545a0e51d4518e3119933)
- [Think in GraphQL](https://ithelp.ithome.com.tw/articles/10209136)
- Modern Web 共筆
  - [在 iCHEF 以 Apollo + React 導入 GraphQL 的經驗 - 張登皓](https://hackmd.io/@ModernWeb/2019/%2F%40ModernWeb%2FHJOmKQFNr)
  - [GraphQL Best Practice - 曾建勳 (kpman)](https://hackmd.io/@ModernWeb/2019/%2F%40ModernWeb%2FBkf-KXFNH)
- Server-side rendering - [How to combine Client Side Rendering with Server Side Rendering by using GraphQL (Apollo)](https://medium.com/rytass/how-to-combine-client-side-rendering-with-server-side-rendering-by-using-graphql-apollo-e36be1f46713)
  - 可使用 `getDataFromTree` and `renderToStringWithData` SSR functions 來減少沒用 SSR 的 bundle sizes

---

- 為何不熱門：
  - 必須要在服務端搭建符合 GraphQL spec 的接口，改寫服務端暴露數據的方式
  - 用 Node + React 架構外，引入 GraphQL 成本略高，風險也不小
  - 數據庫查詢可能會成為性能瓶頸

---

## Modern Web 共筆

https://modernweb.tw/agenda.html
https://hackmd.io/@ModernWeb/2019/%2F71piZu48R_CLqXaDx9-pNw
