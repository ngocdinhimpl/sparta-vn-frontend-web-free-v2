# Báo cáo Rà soát Bảo mật – Sparta VN (FE + BE)

**Ngày:** 2026-08-05  
**Phạm vi:** Frontend (sparta-vn-frontend-web-free-v2, deploy Vercel) và Backend (sparta-vn-be, deploy Render)  
**Người thực hiện:** Security review

## Tổng quan các vấn đề

| # | Vấn đề | Repo | Mức độ | Trạng thái |
|---|---|---|---|---|
| 1 | Collection `rankings` cho ghi công khai (không cần đăng nhập) | FE (Firestore Rules) | Cao | Chưa xử lý |
| 2 | Collection `vocabulary` cho mọi user đã đăng nhập ghi | FE (Firestore Rules) | Cao | Chưa xử lý |
| 3 | Công cụ admin ghi vocabulary bị expose ra global (`window.VocabularyMigration`) | FE | Cao | Chưa xử lý |
| 4 | Endpoint `/api/pronunciation` không rate limit → đốt quota/chi phí Azure | BE | Cao | Chưa xử lý |
| 5 | Multer không giới hạn dung lượng upload | BE | Cao | Chưa xử lý |
| 6 | CORS mở cho mọi domain (`Access-Control-Allow-Origin: *`) | BE | Trung bình | Chưa xử lý |
| 7 | Endpoint gọi Azure không xác thực người dùng | BE | Trung bình | Chưa xử lý |
| 8 | Chưa bật Firebase App Check (phòng thủ chiều sâu) | FE | Thấp | Chưa xử lý |
| 9 | Repo FE đang public và nằm ở tài khoản cá nhân (không thuộc org công ty) | FE (Governance) | Cao | Chưa xử lý |

---

## FRONTEND

### Vấn đề 1 – Collection `rankings` cho ghi công khai
* **Vị trí:** `firestore.rules: 17-21`
* **Phân loại:** `broken_access_control/auth_bypass`
* **Mô tả:** Rule `allow read: true; allow write: if true;` cho phép bất kỳ ai không cần đăng nhập đọc, tạo, sửa, xóa mọi document ranking. ID document đoán được (`${userId}_${avatarId}`, xem `src/services/cloudStorageService.ts:14`). Firebase config công khai trong bundle (`src/services/firebase.ts`) nên collection truy cập được trực tiếp qua Firestore REST API.
* **Kịch bản khai thác:**
  1. Attacker gọi `GET https://firestore.googleapis.com/v1/projects/sparta-65241/databases/(default)/documents/rankings` → liệt kê UID, tên, điểm của mọi user.
  2. GỬI `PATCH/DELETE` tới `rankings/{uid}_{avatarId}` để xóa/ghi đè bản ghi bất kỳ, giả mạo điểm cao, hoặc chèn chuỗi độc hại hiển thị cho mọi người dùng (`src/pages/Ranking.tsx`).
* **Cách đối ứng:** Ràng buộc quyền sở hữu + validate dữ liệu trong rules (xem mục "Firestore Rules đề xuất" bên dưới). Yêu cầu đăng nhập để ghi, hoặc bật Anonymous Auth nếu cần cho khách chơi. Tốt nhất: chuyển việc ghi điểm sang backend (backend đã có điểm thật từ Azure) và khóa `write: false` cho client.

### Vấn đề 2 – Collection `vocabulary` cho mọi user đã đăng nhập ghi
* **Vị trí:** `firestore.rules:10-13`
* **Phân loại:** `broken_access_control/privilege_escalation`
* **Mô tả:** Rule `allow write: if request.auth != null;` cho bất kỳ user đăng nhập nào ghi vào từ vựng dùng chung. Đăng ký mở tự do (`src/pages/Register.tsx:42`), không có kiểm tra admin/role. Collection này là nguồn nội dung chính cho mọi user (`src/services/storageService.ts: 222-263`).
* **Kịch bản khai thác (không cần app):**
  1. Đọc apiKey + projectId từ bundle công khai.
  2. Tự tạo tài khoản qua Firebase Auth REST: `POST identitytoolkit.googleapis.com/v1/accounts:signUp?key=<apiKey>` → nhận idToken.
  3. Gọi `PATCH firestore.googleapis.com/.../vocabulary/<id>` với `Authorization: Bearer <idToken>` ghi đè hàng loạt nội dung học tập cho toàn bộ user; nội dung độc hại còn được gửi làm reference Text tới API Azure (`src/services/api.ts:69`).
* **Vì sao đặc biệt nghiêm trọng (content defacement):**
  * Tác động toàn bộ người dùng cùng lúc: chỉ cần một tài khoản tự đăng ký là ghi đè được nội dung hiển thị cho mọi user (collection dùng chung, đọc nguyên bộ qua `getMasterVocabulary()`).
  * App học tập, có thể có người dùng là trẻ em/học sinh: kẻ xấu thay toàn bộ từ vựng bằng từ tục tĩu, phản cảm, quấy rối không chỉ phá nội dung mà là vấn đề an toàn nội dung cho trẻ, kéo theo rủi ro pháp lý và nguy cơ bị gỡ khỏi App Store / CH Play.
  * Lan sang backend: chuỗi độc hại được đẩy làm referenceText lên Azure, ảnh hưởng cả luồng chấm phát âm.
  * Thiệt hại thương hiệu tức thì: đây là kiểu tấn công "gây tiếng vang" (defacement), tổn hại uy tín ngay khi xảy ra.
* **Cách đối ứng:** Đặt `allow write: if false;` cho client, seeding/admin làm qua Admin SDK / Firebase Console. Nếu cần admin ghi trong app thì gate bằng custom claim `request.auth.token.admin == true`. Cân nhắc thêm kiểm duyệt nội dung (moderation) ở luồng seeding admin.

### Vấn đề 3 – Công cụ admin bị expose ra global
* **Vị trí:** `src/services/vocabularyMigration.ts: 117-119` (`window.VocabularyMigration = VocabularyMigration`)
* **Mô tả:** Các hàm ghi vocabulary (`seedMasterVocabulary`, `addMasterVocabularyItem`, `updateMasterVocabularyItem`) được gán vào global, ai mở console cũng gọi được. Kết hợp với Vấn đề 2 khiến khai thác dễ hơn (không cần viết code REST).
* **Cách đối ứng:** Xóa dòng gán `window.VocabularyMigration`. Không ship công cụ admin tới người dùng cuối.

### Vấn đề 8 – Chưa bật Firebase App Check
* **Mô tả:** Không có App Check nên các request giả (curl/script) không đến từ app thật vẫn được Firebase chấp nhận (miễn có token hợp lệ). Đây là lớp chặn kịch bản “gọi thẳng REST API".
* **Cách đối ứng:** Bật App Check (reCAPTCHA v3) trong Firebase Console, khởi tạo trong `src/services/firebase.ts`, và bật "Enforce" cho Firestore.
```javascript
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("<recaptcha-site-key>"),
  isTokenAutoRefreshEnabled: true,
});
```

### Vấn đề 9 – Repo FE đang public và nằm ở tài khoản cá nhân
* **Vị trí:** GitHub repository
* **Thông tin hiện tại:**
  * Repo FE: `git@github.com:ngocdinhimpl/sparta-vn-frontend-web-free-v2.git`
  * Chủ sở hữu: tài khoản cá nhân ngocdinhimpl (GitHub user id: U_kgD0BclJYg)
  * Trạng thái: PUBLIC
  * Đối chiếu: repo BE `git@github.com:ImplVN/sparta-vn-be.git` đã nằm đúng ở org công ty ImplVN (private) - FE thì chưa.
* **Phân loại:** `governance / information_exposure`
* **Mô tả:** Toàn bộ mã nguồn FE (bao gồm firebase.ts, firestore.rules, endpoint backend, luồng nghiệp vụ) đang công khai trên mạng và thuộc quyền sở hữu một tài khoản cá nhân, không thuộc tổ chức công ty. Điều này:
  * Khuếch đại các lỗ hổng 1-3: attacker đọc thẳng firestore.rules và config trong repo → biết chính xác chỗ hở mà không cần dò từ bundle.
  * Rủi ro sở hữu (bus factor): nếu tài khoản cá nhân bị mất quyền/khóa/nghỉ việc, công ty mất kiểm soát mã nguồn; không áp được policy bảo mật/branch protection cấp org.
* **Cách đối ứng:**
  1. Chuyển repo về org công ty ImplVN (GitHub → Settings → Transfer ownership → nhập ImplVN).
  2. Đổi visibility sang Private (GitHub → Settings → Change repository visibility → Private).
  3. Rà lại lịch sử commit (git log) xem có secret nào từng bị commit không; nếu có, xoay (rotate) và purge lịch sử.
  4. Cấu hình lại quyền team, branch protection, và cập nhật deploy hook trên Vercel trỏ về repo mới sau khi transfer.

---

## BACKEND

### Vấn đề 4 – Không rate limit endpoint gọi Azure
* **Vị trí:** `server.js:29` (`/api/pronunciation`), toàn bộ `routes/upload.js`
* **Phân loại:** Lạm dụng tài nguyên / chi phí
* **Mô tả:** Mỗi request `/api/pronunciation` = 1 lần gọi Azure Speech (tính phí theo giờ audio) + 1 lần upload Google Drive. Không có throttle, không auth, CORS mở → attacker gọi liên tục bằng script để đốt quota/tiền Azure.
* **Cách đối ứng:** Thêm `express-rate-limit` cho các endpoint tốn tiền.
```javascript
import rateLimit from "express-rate-limit";
const speechLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15, // 15 req/phút/IP
  message: { error: "Too many requests, please slow down." },
});
app.post("/api/pronunciation", speechLimiter, upload.single("audio"), ...);
app.use("/api/upload", speechLimiter, uploadRoutes);
```

### Vấn đề 5 – Multer không giới hạn dung lượng upload
* **Vị trí:** `server.js:13` (`multer({ dest: "uploads/" })`)
* **Mô tả:** Không đặt `limits.fileSize` → attacker upload file rất lớn, tốn băng thông/đĩa của server.
* **Cách đối ứng:**
```javascript
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
```

### Vấn đề 6 – CORS mở cho mọi domain
* **Vị trí:** `server.js: 19-24` (`Access-Control-Allow-Origin: *`)
* **Mô tả:** Mọi website đều gọi được API, dễ bị lạm dụng từ trang bên thứ ba.
* **Cách đối ứng:** Chỉ cho phép domain frontend chính thức.
```javascript
const ALLOWED = ["https://sparta-vn-frontend-web-free-v2.vercel.app"];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED.includes(origin)) res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
```

### Vấn đề 7 – Endpoint gọi Azure không xác thực người dùng
* **Vị trí:** `server.js:29`
* **Mô tả:** Ai cũng gọi được endpoint gọi Azure, không giới hạn theo user hợp lệ.
* **Cách đối ứng:** Xác thực Firebase ID token bằng firebase-admin trước khi xử lý.
```javascript
import admin from "firebase-admin";
admin.initializeApp({ credential: admin.credential.applicationDefault() });

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
// app.post("/api/pronunciation", requireAuth, speechLimiter, upload.single("audio"), ...)
```
Phía frontend gắn token vào header trong `src/services/api.ts`: `Authorization: Bearer ${await auth.currentUser.getIdToken()}`.

---

## Firestore Rules đề xuất (thay toàn bộ firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    /* MASTER VOCABULARY: chỉ đọc, không cho client ghi */
    match /vocabulary/{vocabId} {
      allow read: if true;
      allow write: if false;
      // Nếu cần admin ghi trong app:
      // allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    /* RANKINGS: chỉ chủ sở hữu ghi, có validate */
    match /rankings/{rankingId} {
      allow read: if true;
      allow create, update: if request.auth != null
        && request.auth.uid == request.resource.data.userId
        && rankingId == request.auth.uid + '_' + request.resource.data.avatarId
        && request.resource.data.score is number
        && request.resource.data.score >= 0
        && request.resource.data.rankingName is string
        && request.resource.data.rankingName.size() <= 30;
      allow delete: if false;
    }

    /* FEEDBACKS giữ nguyên (đã đúng) */
    match /feedbacks/{feedbackId} {
      allow create: if true;
      allow read, update, delete: if false;
    }

    /* USER DATA giữ nguyên (đã đúng) */
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == request.auth.uid; // Cẩn thận với match ** này
    }
  }
}
```
**Deploy:** `firebase deploy --only firestore:rules` (hoặc dán trong Firebase Console → Firestore → Rules).
> ⚠️ **Lưu ý:** Trước khi khóa vocabulary sang `write: false`, hãy đảm bảo dữ liệu đã seed xong (qua Admin SDK/Console).

---

## Khuyến nghị kiến trúc

Áp dụng mô hình lai (hybrid): giữ gọi trực tiếp FE → Firebase cho dữ liệu riêng của user và các thao tác đọc; chuyển các thao tác ghi dữ liệu nhạy cảm/dễ gian lận qua backend. Điều kiện an toàn cho phần gọi trực tiếp là có đủ Security Rules + Auth + App Check.

| Dữ liệu | Đường đi đề xuất | Lý do |
|---|---|---|
| `users/*` (dữ liệu riêng) | Trực tiếp FE → Firebase (giữ nguyên) | Rule đã đúng (uid == userId) |
| `vocabulary` (đọc) | Trực tiếp FE → Firebase | Chỉ đọc, dữ liệu công khai |
| `vocabulary` (ghi/admin) | Backend/Admin SDK | Nội dung dùng chung, khóa client ghi |
| `rankings` (ghi điểm) | Chuyển qua backend | Chống gian lận: backend đã có điểm thật từ Azure, không nên tin client tự khai điểm |
| `rankings` (đọc) | Trực tiếp FE → Firebase | Chỉ đọc, công khai |

---

## Thứ tự triển khai đề xuất

| Ưu tiên | Việc | Repo |
|---|---|---|
| 1 | Sửa & deploy firestore.rules (Vấn đề 1, 2) | FE |
| 2 | Chuyển repo về org ImplVN + đổi sang Private (Vấn đề 9) | FE (GitHub) |
| 2 | Multer limit + CORS + rate limit (Vấn đề 4, 5, 6) | BE |
| 3 | Gỡ `window.VocabularyMigration` (Vấn đề 3) | FE |
| 4 | Verify ID token ở backend (Vấn đề 7) | BE + FE |
| 5 | Bật App Check (Vấn đề 8) | FE + Console |
| 6 | Chuyển ghi rankings sang backend | BE + FE |

> **Bước 1 và 2 chặn được toàn bộ các đường khai thác nghiêm trọng nhất (ghi đè dữ liệu công khai + đốt quota Azure).**
