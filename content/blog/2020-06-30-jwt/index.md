---
title: 'Express - Authentication, Authorization and Security'
path: blog/20200630
tags: [security, express]
date: 2020-06-30
excerpt: 簡介 Express RESTful API Server 範例中 JWT 權限、授權相關。
---

[HackMD](https://hackmd.io/AiLYT8n8TRq5H8ln52b27g?view)

簡介 Express RESTful API Server 範例中 (使用 MongoDB ODM Mongoose)

- 利用 JWT 做驗證 (Authentication)
- 利用自己定義的 User roles 和 permissions 做授權 (Authorization)
- 利用一些現行可防止常見的安全性問題的 middleware、密碼做處理 (Security)

[👉 GitLab Clone](https://gitlab.baifu-tech.net/f2e_tw/hr-api-server)

## [JSON Web Token (JWT)](https://jwt.io/) 簡介

> 有限時間內可利用認證令牌要求對應的 API 操作權限

- 基於 JSON Object 的開放標準協議 [RFC 7519](https://tools.ietf.org/html/rfc7519)
- 適用於授權和訊息交換
  - 單一登錄 (Single Sign On) 是當今廣泛使用 JWT 的功能之一，成本較小且可以在不同的 domain 中輕鬆使用
- 符合 Stateless 無狀態 (payload 中直接給 Server 需要的值，JWT 應能表明身份)
  - 易水平擴展，適用於跨伺服器、跨域的請求
- Token 應只能在 Server 端被驗證，並 **store JWT in HTTPOnly cookies**
  - Cookie 只限被伺服端存取，無法在用戶端讀取
  - 抵禦攻擊者利用 Cross-Site Scripting (XSS) 手法來盜取用戶身份，例如 `document.cookie` 取得 cookies
  - Chrome 有像 [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg) 的查看/修改 Cookie 工具
- 適用於無關安全議題的操作權限授與
- 無法取代 Cookies 或 Session，只是一種新的操作權限的授與方法
  - Session、Cookie、JWT 是可以一起使用的
- 可以做為實現 **OAuth 2.0 授權框架規範** [RFC 6749](https://tools.ietf.org/html/rfc6749) 中的一種認證機制使用

### JWT 組成 (這邊都指 JWS Compact Serialization)

> [JWS(JSON Web Signature)](https://tools.ietf.org/html/rfc7515) 和 [JWE(JSON Web Encryption)](https://tools.ietf.org/html/rfc7516) 是 JWT 的實作方式，這邊簡介和實作範例都是 JWS (Compact Serialization)：小、自包含、最簡易 👻

![](https://i.imgur.com/8ny9Nla.png)  
![](https://i.imgur.com/MbEmWgj.png)  
JWT 由 header、payload、signature 三個部分各自 base64 編碼處理後組成

- header：伺服器如何加解密的依據
  ```json
  {
    "alg": "HS256", // ALGORITHM: required
    "typ": "JWT" // TOKEN TYPE: optional
  }
  ```
- payload (claims)：放認證需要的聲明內容
  ```json
  {
    "sub": "1234567890",
    "name": "John Doe",
    "iat": 1516239022
  }
  ```
  - Reserved (註冊聲明) - 建議但不強制使用
    - iss (issuer)：發行人
    - sub (subject)：主題 (用戶)
    - aud (audience)：目標收件人
      - 通常為 URI 清單，表示此 JWT 可存取該清單中的資源 (位址)
    - exp (expiration time)：到期的時間
    - nbf (not before time)：開始有效的時間
    - iat (issued at time)：發布時間
    - jti (JWT ID)
  - Public (公開聲明) - [IANA JSON Web Token](https://www.iana.org/assignments/jwt/jwt.xhtml#claims) 聲明註冊表上註冊的聲明
  - Private (私有聲明) - 自定義的臨時聲明
- Verify Signature：登入時伺服器端找到吻合的帳戶密碼，就產生一個認證簽名
  - 可以比對 Signature 來確認 data 有無被改動
- 通常會產 Access Token 和 Refresh Token 兩種 Token (此次介紹屬於 Access Token)
- 稍微提一下
  - header 又稱 JOSE Header (JSON Object Signing and Encryption)，[JWE](https://tools.ietf.org/html/rfc7518#section-3.1) 和 [JWS](https://tools.ietf.org/html/rfc7518#section-4.1) 適用的 alg 不相同
  - JWE token 不同於分三段的 JWS，JWE 是分成五段：JOSE Header、Encrypted Key、Initialization Vector(IV)、AAD、Ciphertext、Authentication Tag
    - 其中 JOSE Header 是三種 Header 聯集而成：  
       Protected Header + Shared Unprotected Header + Per-Recipient Unprotected Header

### 產生 JWS 流程

header 和 payload 是可以自行輕易 decode 的 (或直接貼[官網](https://jwt.io/)解) ，不應放任何敏感資訊

1. 讀取 header 中的加密演算法 (`alg`: 必要) 例如 HMAC、SHA256、RSA、none
   - 列消息認證碼 Hash-based Message Authentication Code (HMAC)  
      一種金鑰式雜湊演算法，可以結合加密金鑰 (key) 進行加密最後輸出 64 字元的內容，針對各種哈希算法都通用 (MD5, SHA-1, SHA-256...)
     - HS256 (HMAC with SHA-256)
   - `alg: none` 時 JWT 將不用產生 Signature，就有機會被攻擊來繞過 Token 的來源驗證
2. 建立尚未簽名的令牌  
   將 header 與 payload 各自進行 base64 編碼並且以`.`連結得到
3. 取得簽名令牌 signature  
   利用私鑰 key 對尚未簽名的令牌進行加密簽名得到  
   ⚠️ 絕對要保管好 key，不然誰都可以自行產生 JWT
4. 將 2. 與 base64 編碼後的 3. 結果以`.`連結，即為 JWT token  
   ![](https://i.imgur.com/oMQboKh.png)

### 實作：Express app 中可以透過 [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken) 產生及驗證 JWT(JWS)

- `npm i jsonwebtoken`
- 簽發 token  
   時機：通常會在使用者註冊、登入、更新密碼時產生或更新 JWT Token 來做身份認證 (ps. 用戶被移除時也該讓 Token 失效)  
  `jwt.sign(payload, secretOrPrivateKey, [options, callback])`

  - options 的 algorithm 預設為 HS256
  - Ex. 簽發一個一小時後過期的 JWT token (多種寫法沒有一定)

    ```javascript
    import jwt from 'jsonwebtoken';

    // 1.
    jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: 'foobar',
      },
      'secret'
    );

    // 2.
    jwt.sign(
      {
        data: 'foobar',
      },
      'secret',
      { expiresIn: 60 * 60 }
    );

    // 3. 最好懂 👍
    jwt.sign(
      {
        data: 'foobar',
      },
      'secret',
      { expiresIn: '1h' }
    );
    ```

    實際可能封裝成像 signToken function 每次簽發時使用

    ```javascript
    import jwt from 'jsonwebtoken';

    const signToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
    };
    ```

- 認證 Token  
  若伺服器端在請求中沒有找到 Token，回傳錯誤 (401 Unauthorized)；若有找到 Token 則驗證後再執行操作
  `jwt.verify(token, secretOrPublicKey, [options, callback])`
  ```javascript
  import { promisify } from 'util';
  import jwt from 'jsonwebtoken';
  // ...
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  // decoded.id
  ```
  ```json
  // decoded
  { "id": "5ee38288007f218942c9bd1b", "iat": 1592380082, "exp": 1600156082 }
  ```
- 只認令牌不認人，只能**盡量**確保 key 不會被盜取

  - 最好不要將 token 存在 localStorage (容易被 XSS 攻擊竊取)
  - 只在 HTTPS 安全協定下傳遞
    - Cookie 設定 flag `httpOnly` (無法被 JavaScript 存取), `secure` (只在 HTTPS 傳遞)
  - 設置 token 過期時間... etc.
  - Ex. 如註冊和登入時去產生新的 JWT token 並透過盡量安全的方式送給 client (client 獲得令牌獲得授權)

    - Client 之後再將此令牌 (JWT) 設置在 Header Authorization 去要求 API，Server 再依此做認證，成功的話返回資料

      ```javascript
      const createSendToken = (user, statusCode, res) => {
        const token = signToken(user._id);
        const cookieOptions = {
          expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
          httpOnly: true, // cookie 無法用 JavaScript 讀取但仍可以在 HTTP requests 回傳給 server
        };

        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // 限 HTTPS

        res.cookie('jwt', token, cookieOptions);

        delete user.password;

        res.status(statusCode).json({
          status: 'success',
          token,
          data: {
            user,
          },
        });
      };
      ```

    - 在某些需授權(認證通過)才能操作的 API route 前加一層 Middleware (要 return `next()`)

      ```javascript
      router.patch('/updateMe', authController.protect, userController.updateMe);
      router.delete('/deleteMe', authController.protect, userController.deleteMe);
      ```

      檢查認證：預期 Client 發的 request Headers Authorization 會代上合法 Token & ...

      ```javascript
      // 需要授權的 API 先經過此做 JWT token 認證 (作為 protected route middleware)
      const protect = catchAsync(async (req, res, next) => {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
          token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
          return next(new AppError('認證已失效，請重新登入', 401));
        }

        // 認證 JWT (token key 要正確才過) 取回 payload (可以檢查 JWT 授權者身份或資料有無變造)
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next(new AppError('擁有此認證的使用者已不存在', 401));
        }

        // 檢查 token 簽發時間是否在變更密碼時間之後，是的話應重新登入取得新認證
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next(new AppError('使用者最近變更密碼，請重新登入', 401));
        }

        // 上述檢查沒問題才真正執行 API 查詢操作 (順便傳遞 JWT 的 user)
        req.user = currentUser;
        next();
      });
      ```

## 密碼做 Bcrypt 加密處理再儲存

- Bcrypt 簡介
  - 其實不是加密演算法，而是慢雜湊演算法 (和 SHA1 一樣是種雜湊演算法)
    - 把各個欄位/字元丟進去某個公式計算的方式就叫做雜湊 (Hash)，這個計算公式就稱為雜湊函數 (Hash function)，過程是**不可逆**的
    - Bcrypt 可以透過設定疊代次數讓他變慢 (迭代次數每增加 1 需要的時間就變兩倍)
    - 密碼被破解的風險比 MD5、SHA1 低 (例以疊代五次的 Bcrypt 計算速度大概比 SHA1 慢 1000 倍)
  - 能夠將一個字串**加鹽後雜湊**加密，在要加密的字串中加特定的字符、打亂原始的字符串，使其生成的散列結果產生變化，加鹽次數多越安全，但加密時間也就越長  
    加密後的 bcrypt 分為四個部分  
    ![](https://i.imgur.com/Wp3VHdi.png)
    1. Bcrypt：該字串為 UTF-8 編碼，並且包含一個終止符
    1. Round 回合數：每增加一次就加倍雜湊次數，預設 10 次
    1. Salt 加鹽：128 bits 22 個字元
    1. Hash 雜湊：138 bits 31 個字元
  - 防止 rainbow table attacks
    - Rainbow table 是一個由大量純文本密碼和與每個密碼相對應的 hash 組成的庫
    - [Ultimate Hashing and Anonymity toolkit](https://md5hashing.net/) 可輕易破解長度短簡易的雜湊原文
- [`npm i bcryptjs`](https://www.npmjs.com/package/bcryptjs)
- [`hash(s, salt, callback, progressCallback=)`](https://www.npmjs.com/package/bcryptjs#hashs-salt-callback-progresscallback)  
  在 mongoose 有 password field 的 Schema 上做 save document 前的 middleware 來處理明文密碼範例

  ```javascript
  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // 只有在 password 修改時才執行

    this.password = await bcrypt.hash(this.password, 12); // 用長度12的salt去hash
    this.passwordConfirm = undefined;
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  ```

- 補充一點加密演算法，如：
  - 對稱加密演算法
    - 加密解密都用同一個 key，快且安全
    - 例
      - AES (Advanced Encryption Standard)
      - DES (Data Encryption Standard)、3DES (Triple DES)
      - 速度：AES > 3DES > DES
        - 聽說美國政府機密檔案也用 AES 加密(?)
  - 非對稱加密演算法
    - 會產生一組兩個 Key：公鑰跟私鑰
    - 私鑰可以產出公鑰、公鑰無法產出私鑰
    - 兩把鑰匙在加密、解密上彼此可通用：公鑰加密、私鑰解密，或是私鑰加密、公鑰解密 (HTTPS 的 SSL 數位簽章就是此應用)
    - 例
      _ RSA、DSA (Digital Signature Algorithm)、ECC (Elliptic Curves Cryptography)
      _ 速度：ECC > RSA, DSA
      ![](https://i.imgur.com/m2s3GgW.png)

## 訂定 Role 來限制權限

- 例如 User Model 中的 Schema 定義一 enum 型別的 role，之後依此做權限依據
- 某些需檢查使用者權限才能操作的 API route，可在操作前加一層檢查 user 權限的 middleware

  ```javascript
  router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);
  ```

  ```javascript
  const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError('您沒有此操作權限', 403));
      }

      next();
    };
  };
  ```

## 一些跟安全性相關的 Middleware library

> Express mongoose restful api 實作用到

- [`npm i helmet`](https://www.npmjs.com/package/helmet)
  - A collection of 12 smaller middleware functions that set HTTP response headers.
    Express app 中的安全最佳做法，會適當設定 HTTP 標頭，有助於防範應用程式出現已知的 Web 漏洞
  - 應放在最一開始設定
    ```javascript
    app.use(helmet());
    ```
- [`npm i express-rate-limit`](https://www.npmjs.com/package/express-rate-limit)

  - 限制來自同一 IP 的重複請求
  - 可防止 DDoS

    ```javascript
    import rateLimit from 'express-rate-limit';

    const limiter = rateLimit({
      max: 100,
      windowMs: 60 * 60 * 1000,
      message: '此IP請求太多次了！請一小時後再試！',
    });
    app.use('/api', limiter);
    ```

- [`npm i express-mongo-sanitize`](https://www.npmjs.com/package/express-mongo-sanitize)
  - Data sanitization 防止 NoSQL query injection，這邊主要針對 MongoDB 的保留字如 `$`, `.`。例如在某含有 find email 操作的 api 中 request body 代相當於 query all 的值 `{ "email": {"$gt": ""} }`，就會被擋下來
    ```javascript
    app.use(mongoSanitize());
    ```
- [`npm i xss-clean`](https://www.npmjs.com/package/xss-clean)
  - Data sanitization 防止 XSS 攻擊，可替換 `<` 為 `&lt;`
    ```javascript
    app.use(xss());
    ```
- [`npm i hpp`](https://www.npmjs.com/package/hpp)
  - 用於防止 HTTP Parameter Pollution
  - 例如網址後面代的 queryString key 相同的不只一個時，它會自動取成最後一個、前面都無效
    - 但是可以透過把特定 key 加白名單讓它得以不被過濾
  - 應該在最後設定
    ```javascript\
    app.use(
      hpp({
        whitelist: ['age', 'team']
      });
    );
    ```

## 重設密碼機制

利用賦予請求重設密碼用戶者 隨機 resetToken 與 Token 過期時間儲存進 DB (同時寄信)，並在更新密碼時實作中用來驗證並透過 Token 查回 User 做更新

- [`npm i nodemailer`](https://www.npmjs.com/package/nodemailer)
- 開發階段沒有 Mail Server 可以使用 [MailTrap](https://mailtrap.io/) 測試寄收信  
  ![](https://i.imgur.com/yBu0U7l.png)
- 利用 Node.js 的內建模組 crypto 來簡單加密處理資料，以下實作範例

  1. 在 Model Schema methods 定義產生密碼重設 Token 並設置過期時間存 DB user 方法：注意是 return 未 Hash 的 Token (要代給修改密碼 API 的 Token)，但儲存的是有在經過 hash 處理後的 Token

     ```javascript
     // 透過 node 內建 crypto 安全的亂數產生密碼重設 token，並設置過期時間
     userSchema.methods.createPasswordResetToken = function() {
       const resetToken = crypto.randomBytes(32).toString('hex');

       this.passwordResetToken = crypto
         .createHash('sha256') // 創建sha256 hash實例
         .update(resetToken) // update()將字符串相加
         .digest('hex'); // digest()將字符串hash返回

       this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins 後過期

       return resetToken;
     };
     ```

  2. 忘記密碼 API 查詢 email 的 User 存在用對它賦予重設密碼 Token 和過期時間儲存；不存在再清掉重設相關欄位，同時寄出代有該 Token 的重設密碼 API 給 User

     ```javascript
     const forgotPassword = catchAsync(async (req, res, next) => {
       const user = await User.findOne({ email: req.body.email });
       if (!user) {
         return next(new AppError('查無此 email 使用者', 404));
       }

       // 產生 reset 用的隨機 token(Model schema methods 先定義好)
       const resetToken = user.createPasswordResetToken();
       await user.save({ validateBeforeSave: false });

       // 設定寄信內容
       const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
       const message = `忘記密碼？請用 PATCH 設置 password 和 passwordConfirm 請求 API: ${resetURL}.\n如果您無忘記密碼，請無視此訊息。`;

       try {
         await sendEmail({
           email: user.email,
           subject: '密碼重設 (10分鐘後過期)',
           message,
         });

         res.status(200).json({
           status: 'success',
           message: '重設密碼 Token 已寄出！',
         });
       } catch (err) {
         user.passwordResetToken = undefined;
         user.passwordResetExpires = undefined;
         await user.save({ validateBeforeSave: false });

         return next(new AppError('寄信發生錯誤！'), 500);
       }
     });
     ```

     ```javascript
     import nodemailer from 'nodemailer';

     export const sendEmail = async (options) => {
       // 1) Create a transporter
       const transporter = nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
           user: process.env.EMAIL_USERNAME,
           pass: process.env.EMAIL_PASSWORD,
         },
       });

       // 2) Define the email options
       const mailOptions = {
         from: '百阜人資系統 <baifu.hr@baifu-tech.net>',
         to: options.email,
         subject: options.subject,
         text: options.message,
         // html:
       };

       // 3) Actually send the email
       await transporter.sendMail(mailOptions);
     };
     ```

     3. 得到重設密碼的 API 驗證 Token 和是否有效後再依 Token 查回 User，對它做密碼更新

     ```javascript
     const resetPassword = catchAsync(async (req, res, next) => {
       // hashed resetToken and compare document's hashed resetToken passwordResetToken
       const hashedToken = crypto
         .createHash('sha256')
         .update(req.params.token)
         .digest('hex');

       const user = await User.findOne({
         passwordResetToken: hashedToken,
         passwordResetExpires: { $gt: Date.now() },
       });

       // 檢查 token 未過期且使用者存在
       if (!user) {
         return next(new AppError('Token 無效或是已過期', 400));
       }
       user.password = req.body.password;
       user.passwordConfirm = req.body.passwordConfirm;
       user.passwordResetToken = undefined;
       user.passwordResetExpires = undefined;
       await user.save(); // 一樣會經過 middleware 做密碼 hash 並修改 passwordChangedAt

       // 使用者產生新 token 回傳(登入)
       createSendToken(user, 200, res);
     });
     ```

## CSRF

因為瀏覽器的機制，你只要發送 request 給某個網域，就會把關聯的 cookie 一起帶上去。如果使用者是登入狀態，那這個 request 就理所當然包含了他的資訊（例如說 session id），這 request 看起來就像是使用者本人發出的。  
又稱 One-Click Attack，但其實甚至不需要 click 而且不會被察覺(沒有 redirect)  
例如

```html
<iframe style="display:none" name="csrf-frame"></iframe>
<form method="POST" action="https://small-min.blog.com/delete" target="csrf-frame" id="csrf-form">
  <input type="hidden" name="id" value="3" />
  <input type="submit" value="submit" />
</form>
<script>
  document.getElementById('csrf-form').submit();
</script>
```

> 所以記得每次使用完網站就登出，就可以避免掉 CSRF

### Server 防範

1. 檢查 Referer (request 從哪來)，但有的瀏覽器不會帶，或是被關掉
2. 加上圖形驗證碼、簡訊驗證碼 ...
3. 產生隨機的 CSRF Token 存在 Server Session，並核對請求者帶的 Session 是否一樣
4. Double Submit Cookie：Server 比對 Cookie 內的 CSRF Token 與 form 裡面的 CSRF Token，檢查是否有值並且相等

下次再補充 JWE (JSON Web Encryption)、 OAuth 2.0 的部分

## Reference

- [React Authentication: How to Store JWT in a Cookie](https://medium.com/@ryanchenkie_40935/react-authentication-how-to-store-jwt-in-a-cookie-346519310e81)
- [淺談 JWT 的安全性與適用情境](https://medium.com/mr-efacani-teatime/%E6%B7%BA%E8%AB%87jwt%E7%9A%84%E5%AE%89%E5%85%A8%E6%80%A7%E8%88%87%E9%81%A9%E7%94%A8%E6%83%85%E5%A2%83-301b5491b60e)
- [是誰在敲打我窗？什麼是 JWT？](https://5xruby.tw/posts/what-is-jwt/)
- [聽說不能用明文存密碼，那到底該怎麼存？](https://medium.com/starbugs/how-to-store-password-in-database-sefely-6b20f48def92)
- [加密算法(DES,AES,RSA,MD5,SHA1,Base64)比較和項目應用](https://kknews.cc/zh-tw/code/kbqp4bb.html)
- [關於 Error.captureStackTrace](http://blog.shaochuancs.com/about-error-capturestacktrace/)
- [Mongoose API Document](https://mongoosejs.com/docs/api.html)
