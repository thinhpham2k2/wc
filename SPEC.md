# World Cup Prediction App - Spec

## Tổng quan

Ứng dụng dự đoán tỉ số World Cup trong nhóm bạn, tích lũy điểm và xếp hạng.

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend + API | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Custom (invite link + password) |
| Deploy | Vercel |

---

## Tính năng

### 1. Authentication & User Management

- **Admin cố định** — config qua env var `ADMIN_USERNAME`
- **Invite flow:**
  1. Admin tạo username cho user
  2. Hệ thống sinh invite link (token 1 lần, có thời hạn)
  3. User click link → đặt password → vào app
- **Đăng nhập:** username + password (JWT session)

### 2. Quản lý trận đấu (Admin)

- Tạo trận: 2 đội, giờ kick-off, cho phép hòa hay không
- Sửa/xóa trận
- Cập nhật kết quả & tỉ số sau trận
- Trận tự động khóa dự đoán khi đến giờ kick-off

### 3. Dự đoán (User)

- Xem danh sách trận sắp diễn ra
- Đoán tỉ số cho từng trận (trước giờ kick-off)
- Nếu trận không cho phép hòa → không thể nhập tỉ số hòa
- Có thể sửa dự đoán cho đến khi trận bị khóa
- Xem lịch sử dự đoán của mình (đúng/sai, điểm nhận được)

### 4. Tính điểm

| Loại | Điểm |
|------|------|
| Đoán đúng kết quả (thắng/thua/hòa) | +1 |
| Đoán đúng tỉ số chính xác | +2 (bonus, tổng = 3) |
| Đoán sai | 0 |

> Ví dụ: Trận Brazil vs Argentina, kết quả 2-1.
> - User đoán 3-1 (đúng Brazil thắng) → +1 điểm
> - User đoán 2-1 (đúng tỉ số) → +1 + 2 = 3 điểm
> - User đoán 0-2 (sai kết quả) → 0 điểm

### 5. Bảng xếp hạng

- Xếp hạng theo tổng điểm tích lũy
- Hiển thị: thứ hạng, tên, tổng điểm, số trận đoán đúng kết quả, số trận đoán đúng tỉ số
- Realtime cập nhật khi admin nhập kết quả

### 6. Trang chủ

- Hiển thị **luật chơi** rõ ràng (cách tính điểm, quy tắc hòa)
- Trận sắp diễn ra + countdown
- Bảng xếp hạng tóm tắt (top 5)
- Trận gần nhất đã có kết quả

---

## Database Schema

```
User
├── id (uuid)
├── username (unique)
├── passwordHash
├── isAdmin (boolean)
├── inviteToken (nullable)
├── inviteExpiry (nullable)
├── createdAt

Match
├── id (uuid)
├── teamA (string)
├── teamB (string)
├── kickoffTime (datetime)
├── allowDraw (boolean)
├── scoreA (nullable int) — kết quả thực tế
├── scoreB (nullable int)
├── isCompleted (boolean)
├── createdAt

Prediction
├── id (uuid)
├── userId (fk → User)
├── matchId (fk → Match)
├── predictedScoreA (int)
├── predictedScoreB (int)
├── points (nullable int) — tính sau khi có kết quả
├── createdAt
├── updatedAt
├── UNIQUE(userId, matchId)
```

---

## Giao diện (Pages)

| Route | Mô tả | Auth |
|-------|--------|------|
| `/` | Trang chủ: luật chơi, trận sắp tới, top xếp hạng | Public |
| `/login` | Đăng nhập | Public |
| `/invite/[token]` | Đặt password từ invite link | Public |
| `/matches` | Danh sách trận + form dự đoán | User |
| `/leaderboard` | Bảng xếp hạng đầy đủ | User |
| `/history` | Lịch sử dự đoán cá nhân | User |
| `/admin/matches` | CRUD trận đấu, cập nhật kết quả | Admin |
| `/admin/users` | Quản lý user, tạo invite link | Admin |

---

## UI/UX

- **Responsive** — mobile first (nhóm bạn dùng điện thoại là chính)
- Trận đã khóa: hiện rõ icon 🔒, disable form
- Kết quả đúng: highlight xanh ✅, sai: đỏ ❌
- Điểm bonus (đúng tỉ số): badge đặc biệt ⭐
- Countdown đến giờ kick-off cho trận chưa khóa
- Dark mode (tùy chọn)

---

## Quy tắc business

1. User chỉ được đoán 1 lần/trận (có thể sửa trước giờ khóa)
2. Sau giờ kick-off → không thể tạo/sửa dự đoán
3. Admin config `allowDraw` từng trận — nếu `false`, validate tỉ số không được bằng nhau
4. Điểm chỉ được tính khi admin cập nhật kết quả
5. Invite link hết hạn sau 7 ngày (configurable)

---

## Environment Variables

```env
DATABASE_URL=            # Neon PostgreSQL connection string
ADMIN_USERNAME=          # Username của admin
JWT_SECRET=              # Secret cho JWT token
NEXT_PUBLIC_APP_URL=     # URL app (cho invite link)
```

---

## Roadmap triển khai

1. Setup project (Next.js + Prisma + Neon)
2. Database schema + migration
3. Auth (login, invite flow)
4. Admin: CRUD matches, cập nhật kết quả
5. User: dự đoán, lịch sử
6. Bảng xếp hạng + tính điểm
7. Trang chủ (luật chơi, overview)
8. UI polish + responsive
9. Deploy Vercel

---

## Auto-Sync Kết Quả (football-data.org)

### Nguồn dữ liệu

- **API:** [football-data.org](https://www.football-data.org/) (Free tier)
- **Rate limit:** 10 requests/phút (đủ dùng)
- **Endpoint chính:** `GET /v4/competitions/WC/matches`
- **Auth:** API key qua header `X-Auth-Token`

### Cơ chế hoạt động

1. **Vercel Cron Job** chạy mỗi **1 phút** (`* * * * *`)
2. Query các trận đang diễn ra (`status=IN_PLAY`) và vừa kết thúc (`status=FINISHED`)
3. So sánh với DB — nếu trận chuyển sang `FINISHED`:
   - Cập nhật `scoreA`, `scoreB`, `isCompleted = true`
   - **Lập tức tính điểm** cho tất cả predictions của trận đó
   - Cập nhật bảng xếp hạng realtime
4. Admin vẫn có thể override kết quả thủ công (ưu tiên cao hơn API)

### Tính điểm tự động

Khi trận kết thúc (detected qua API hoặc admin cập nhật):

```
for each prediction of match:
  if predictedScoreA == scoreA AND predictedScoreB == scoreB:
    points = 3  // đúng tỉ số chính xác
  else if result(predicted) == result(actual):
    points = 1  // đúng kết quả (thắng/thua/hòa)
  else:
    points = 0
  save prediction.points
```

### Flow chi tiết

```
[Cron mỗi 1 phút]
      │
      ▼
Gọi football-data.org API
      │
      ▼
Lọc trận FINISHED mà DB chưa có kết quả
      │
      ▼
Update scoreA, scoreB, isCompleted = true
      │
      ▼
Tính điểm TẤT CẢ predictions của trận
      │
      ▼
Leaderboard tự động cập nhật
```

### Environment Variables bổ sung

```env
FOOTBALL_DATA_API_KEY=   # API key từ football-data.org
```

### Lưu ý

- Nếu API down hoặc rate limit → skip, retry ở lần cron tiếp theo
- Log mỗi lần sync để debug
- Admin có nút "Force Sync" để trigger thủ công
- Trận không match với DB (tên đội khác) → cảnh báo admin, không tự cập nhật

---

## Ngoài scope (có thể thêm sau)

- Notification (email/push)
- Leaderboard theo mùa giải
- Chat/comment
- Đoán penalty, MVP...
