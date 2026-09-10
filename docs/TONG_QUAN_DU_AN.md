# Tài Liệu Tổng Quan Dự Án — FPT ICO Summit 2026

> **Cập nhật lần cuối:** Tháng 9/2026  
> **Tên sự kiện:** FPT ICO Summit 2026  
> **Website:** https://fpticosummit.com  
> **Thời gian:** 20–22 tháng 11 năm 2026  
> **Địa điểm:** FPT University Can Tho Campus

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Hệ thống xác thực & phân quyền](#4-hệ-thống-xác-thực--phân-quyền)
5. [Cơ sở dữ liệu & Models](#5-cơ-sở-dữ-liệu--models)
6. [Server Actions (Luồng xử lý logic)](#6-server-actions-luồng-xử-lý-logic)
7. [API Routes](#7-api-routes)
8. [Cấu trúc trang (App Router)](#8-cấu-trúc-trang-app-router)
9. [Components](#9-components)
10. [Dữ liệu tĩnh (Data Layer)](#10-dữ-liệu-tĩnh-data-layer)
11. [Đa ngôn ngữ (i18n)](#11-đa-ngôn-ngữ-i18n)
12. [Thư viện tiện ích (Utils & Config)](#12-thư-viện-tiện-ích-utils--config)
13. [Scripts quản trị](#13-scripts-quản-trị)
14. [Cấu hình môi trường](#14-cấu-hình-môi-trường)
15. [Sơ đồ luồng dữ liệu chính](#15-sơ-đồ-luồng-dữ-liệu-chính)

---

## 1. Tổng quan dự án

Website FPT ICO Summit 2026 phục vụ hai mục tiêu song song:

- **Uy tín tổ chức:** Dành cho lãnh sự quán, đại học quốc tế, tổ chức giáo dục và lãnh đạo FPT.
- **Thu hút sinh viên:** Dành cho học sinh/sinh viên quan tâm đến du học, học bổng, workshop và cơ hội toàn cầu.

Hệ thống là một **ứng dụng Next.js full-stack** với:
- Trang landing công khai (nhiều phần cuộn dọc)
- Cổng đăng ký thành viên (member dashboard)
- Cổng đối tác (partner dashboard) để nộp đề xuất workshop/biểu diễn
- Bảng quản trị admin
- Cổng vận hành sự kiện cho nhân viên (staff)

---

## 2. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|---------|
| **Next.js** | 16.3.0 | Framework React full-stack (App Router) |
| **React** | 19.2.8 | Thư viện UI |
| **TypeScript** | ^5 | Type safety toàn bộ codebase |
| **MongoDB** | ^7.5.0 | Cơ sở dữ liệu chính (driver thô, không dùng Mongoose) |
| **NextAuth v5** | ^5.0.0-beta.32 | Xác thực (Auth.js) |
| **Tailwind CSS** | ^4 | Styling |
| **Cloudinary** | ^2.10.1 | CDN & quản lý media (hình ảnh) |
| **ExcelJS** | ^4.4.0 | Xuất báo cáo Excel (.xlsx) |

**Không dùng:** Mongoose, Prisma, Redux, bất kỳ CMS/backend phụ nào cho MVP.

---

## 3. Cấu trúc thư mục

```
fpt-ico-summit/
├── docs/                          ← Tài liệu dự án
│   ├── PROJECT.md                 ← Mục tiêu, stakeholders
│   ├── TECH.md                    ← Hướng dẫn kỹ thuật
│   ├── DESIGN.md                  ← Hướng dẫn thiết kế
│   ├── CONTENT.md                 ← Nội dung & bản sao
│   ├── ASSETS.md                  ← Quản lý tài sản media
│   ├── BUILD_PLAN.md              ← Kế hoạch xây dựng
│   └── TONG_QUAN_DU_AN.md        ← (file này)
├── public/                        ← Tài sản tĩnh
├── scripts/                       ← Các script quản trị Node.js
│   ├── create-admin.mjs           ← Tạo tài khoản Admin đầu tiên
│   ├── init-mongodb.mjs           ← Khởi tạo MongoDB (collections, indexes)
│   ├── test-mongodb.mjs           ← Kiểm tra kết nối MongoDB
│   ├── diagnose-auth.mjs          ← Chẩn đoán sự cố xác thực
│   └── test-sanitizer.mjs         ← Kiểm tra bộ lọc HTML
├── src/
│   ├── app/                       ← Next.js App Router
│   │   ├── [locale]/              ← Các trang phân theo ngôn ngữ
│   │   ├── actions/               ← Server Actions (logic xử lý)
│   │   ├── api/                   ← API Routes
│   │   ├── admin/login/route.ts   ← Redirect route cũ
│   │   └── staff/login/route.ts   ← Redirect route cũ
│   ├── auth.ts                    ← Cấu hình NextAuth v5
│   ├── components/                ← React Components
│   │   ├── admin/                 ← Components cho Admin
│   │   ├── auth/                  ← Components đăng nhập/đăng ký
│   │   ├── layout/                ← Header, Footer
│   │   ├── member/                ← Components Dashboard thành viên
│   │   ├── partner/               ← Components Dashboard đối tác
│   │   ├── public/                ← Components trang công khai
│   │   ├── sections/              ← Các section trang chủ
│   │   ├── staff/                 ← Components cổng nhân viên
│   │   └── ui/                    ← UI tái sử dụng chung
│   ├── data/                      ← Dữ liệu tĩnh (không có backend)
│   ├── i18n/                      ← Hệ thống đa ngôn ngữ
│   ├── lib/
│   │   ├── auth/                  ← Bảo vệ phân quyền
│   │   ├── config/                ← Cấu hình nghiệp vụ
│   │   ├── db/                    ← Tầng cơ sở dữ liệu
│   │   │   ├── models/            ← TypeScript interfaces (schemas)
│   │   │   └── repositories/      ← Truy vấn MongoDB
│   │   └── utils/                 ← Tiện ích dùng chung
│   └── proxy.ts                   ← (Dự phòng)
├── next.config.ts                 ← Cấu hình Next.js
├── package.json
└── tsconfig.json
```

---

## 4. Hệ thống xác thực & phân quyền

### 4.1 Cấu hình NextAuth (`src/auth.ts`)

Sử dụng **Auth.js v5** với chiến lược JWT và `CredentialsProvider` (email + password).

**Luồng đăng nhập:**
1. Người dùng gửi email + password
2. `authorize()` gọi `findUserByEmail()` từ MongoDB
3. Kiểm tra `user.status === "ACTIVE"` và `lockedUntil`
4. Xác minh mật khẩu qua `verifyPassword()` (scrypt)
5. Ghi nhận lần đăng nhập thành công/thất bại
6. Nhúng `role`, `partnerType`, `organizationId`, `mustChangePassword` vào JWT token

**Các callback:**
- `jwt()` — nhúng thêm thông tin role vào token
- `session()` — chuyển thông tin từ token vào session object

### 4.2 Guards phân quyền (`src/lib/auth/authorization.ts`)

Mọi Server Action đều phải gọi một trong các hàm guard này **trước khi xử lý**:

| Hàm | Vai trò được phép | Vị trí dùng |
|-----|------------------|-------------|
| `requireUser()` | Bất kỳ user đã đăng nhập | Đổi mật khẩu |
| `requireAdmin()` | `ADMIN` | Tạo tài khoản, duyệt proposals |
| `requirePartner()` | `PARTNER` | Nộp đề xuất workshop/biểu diễn |
| `requireMember()` | `MEMBER` | Đăng ký Summit, chọn activities |
| `requireSummitStaff()` | `SUMMIT_STAFF` | (Hiếm dùng trực tiếp) |
| `requireSummitOperationsAccess()` | `ADMIN` hoặc `SUMMIT_STAFF` | Check-in, booth, lịch trình |
| `requireRole([...roles])` | Nhiều role tùy chỉnh | Nội bộ |

**Cơ chế bảo mật:** Mỗi guard **truy vấn MongoDB thực tế** (không chỉ tin JWT) để xác minh trạng thái tài khoản đang active — ngăn chặn JWT cũ bị lợi dụng sau khi tài khoản bị khóa.

### 4.3 Hệ thống mật khẩu (`src/lib/auth/password.ts`)

- **Thuật toán:** `scrypt` (Node.js crypto, không phụ thuộc thư viện ngoài)
- **Định dạng hash:** `scrypt$v1$<saltHex>$<derivedKeyHex>`
- **Key length:** 64 bytes, Salt length: 16 bytes
- **So sánh:** `timingSafeEqual` (chống timing attack)
- **Chính sách mật khẩu:** Tối thiểu 12 ký tự, tối đa 128 ký tự
- **Mật khẩu tạm thời:** 16 ký tự ngẫu nhiên từ bộ ký tự chữ+số+đặc biệt

### 4.4 Các vai trò người dùng (UserRole)

```
ADMIN          → Quản trị viên hệ thống toàn quyền
SUMMIT_STAFF   → Nhân viên vận hành sự kiện (check-in, booth, lịch trình)
PARTNER        → Đối tác (đại học/lãnh sự) — nộp proposals, cập nhật tổ chức
MEMBER         → Thành viên (sinh viên/người tham dự) — đăng ký, chọn hoạt động
```

---

## 5. Cơ sở dữ liệu & Models

### 5.1 Kết nối MongoDB (`src/lib/db/mongodb.ts`)

- **Kết nối lười (lazy):** Chỉ kết nối khi thực sự có truy vấn
- **Dev mode:** Dùng biến global để tránh tạo kết nối mới mỗi lần HMR reload
- **Tên DB mặc định:** `fpt_ico_summit` (đọc từ env `MONGODB_DB_NAME`)
- **Hàm chính:**
  - `getMongoClient()` — lấy hoặc tạo kết nối MongoClient
  - `getDb(dbName?)` — lấy database instance

### 5.2 Collections (`src/lib/db/collections.ts`)

Tất cả tên collection được khai báo tập trung trong hằng số `COLLECTIONS`:

| Tên hằng số | Tên collection trong MongoDB | Mô tả |
|-------------|------------------------------|-------|
| `SUMMIT_EDITIONS` | `summitEditions` | Metadata các kỳ hội nghị |
| `USERS` | `users` | Tài khoản người dùng (RBAC) |
| `ACCOUNT_REQUESTS` | `accountRequests` | (Deprecated) Yêu cầu tài khoản cũ |
| `ORGANIZATIONS` | `organizations` | Tổ chức đối tác (đại học, lãnh sự) |
| `ORGANIZATION_PARTICIPATIONS` | `organizationParticipations` | Liên kết tổ chức ↔ kỳ hội nghị |
| `AUDIT_LOGS` | `auditLogs` | Nhật ký kiểm toán hệ thống |
| `SCHOLARSHIPS` | `scholarships` | Học bổng từ đối tác |
| `SUMMIT_REGISTRATIONS` | `summitRegistrations` | Đăng ký tham dự của thành viên |
| `SUMMIT_ACTIVITIES` | `summitActivities` | Đề xuất Workshop/Biểu diễn |
| `SUMMIT_CHECK_INS` | `summitCheckIns` | Check-in tại chỗ theo ngày |
| `SUMMIT_BOOTH_ASSIGNMENTS` | `summitBoothAssignments` | Phân công booth cho đối tác |
| `SUMMIT_ACTIVITY_SELECTIONS` | `summitActivitySelections` | Thành viên chọn hoạt động tự chọn |
| `SUMMIT_ACTIVITY_ATTENDANCES` | `summitActivityAttendances` | Điểm danh hoạt động (do staff xác nhận) |
| `PARTNER_SHOWCASE_ENTRIES` | `partnerShowcaseEntries` | Logo đối tác trên trang chủ |

### 5.3 Models (TypeScript Interfaces)

#### `User` (`src/lib/db/models/user.ts`)

```
User {
  _id              ObjectId
  email            string          (email hiển thị)
  emailNormalized  string          (email đã chuẩn hóa, lowercase)
  name             string
  passwordHash     string          (scrypt$v1$...)
  role             UserRole        (ADMIN|SUMMIT_STAFF|PARTNER|MEMBER)
  partnerType?     PartnerType     (UNIVERSITY|CONSULATE) — chỉ cho PARTNER
  organizationId?  ObjectId        — chỉ cho PARTNER
  profile?         UserProfileMetadata
  status           UserStatus      (ACTIVE|SUSPENDED|DISABLED)
  mustChangePassword boolean
  failedLoginAttempts number
  lockedUntil?     Date
  lastLoginAt?     Date
  createdAt        Date
  updatedAt        Date
}
```

**Loại thành viên (MemberType):** `FPT_CANTHO_STUDENT` hoặc `EXTERNAL_PARTICIPANT`

#### `Organization` (`src/lib/db/models/organization.ts`)

Tổ chức đối tác với hệ thống **draft → published** hai bước:

```
Organization {
  type             OrganizationType    (UNIVERSITY|CONSULATE)
  name             string
  country          string
  status           OrganizationStatus  (DRAFT|ACTIVE|ARCHIVED)
  isPublished      boolean
  draftStatus      DraftStatus         (NONE|DRAFT|IN_REVIEW|CHANGES_REQUESTED)
  draftProfile?    OrganizationProfileSnapshot   (bản nháp đang chỉnh sửa)
  publishedProfile? OrganizationProfileSnapshot  (bản đã duyệt, hiển thị công khai)
  review?          { submittedAt, reviewedAt, feedback, ... }
}
```

#### `SummitActivity` (`src/lib/db/models/summit-activity.ts`)

Đề xuất Workshop hoặc Biểu diễn Sân khấu với quy trình **2 giai đoạn**:

```
SummitActivity {
  type             ActivityType        (WORKSHOP|STAGE_PERFORMANCE)
  trackId?         WorkshopTrackId     (Track chủ đề — chỉ Workshop)
  topicReviewStatus WorkshopTopicReviewStatus   (Giai đoạn A: NONE|DRAFT|IN_REVIEW|CHANGES_REQUESTED|ACCEPTED)
  acceptedTopicSnapshot? AcceptedTopicSnapshot   (lưu topic đã được duyệt — bất biến)
  performanceScopeId?    PerformanceScopeId       (Phạm vi — chỉ Biểu diễn)
  isContentApproved boolean
  draftStatus      ActivityDraftStatus  (Giai đoạn B: NONE|DRAFT|IN_REVIEW|CHANGES_REQUESTED)
  draftSnapshot    WorkshopSnapshot | StagePerformanceSnapshot
  approvedSnapshot? WorkshopSnapshot | StagePerformanceSnapshot
  scheduleDraft?   ActivityScheduleDraft     (draft lịch trình — do Staff tạo)
  publishedSchedule? ActivityPublishedSchedule  (lịch đã công bố)
}
```

**Luồng duyệt Workshop:**
1. Partner tạo draft → chọn Track + Topic → gửi **Giai đoạn A** (Topic Proposal)
2. Admin duyệt/yêu cầu chỉnh sửa Topic
3. Sau khi Topic được ACCEPTED → Partner điền nội dung đầy đủ → gửi **Giai đoạn B**
4. Admin duyệt/yêu cầu chỉnh sửa nội dung → phê duyệt cuối
5. Staff phân lịch trình → công bố

**Luồng duyệt Biểu diễn:** Một giai đoạn (bỏ qua Topic Proposal).

#### `SummitRegistration` (`src/lib/db/models/summit-registration.ts`)

```
SummitRegistration {
  editionId        ObjectId
  userId           ObjectId
  participantType  ParticipantType    (FPT_STUDENT|EXTERNAL_PARTICIPANT)
  attendeeSnapshot { fullName, phone, email, studentId? }
  status           RegistrationStatus (REGISTERED|CANCELLED)
  registeredAt     Date
}
```

### 5.4 Repositories (`src/lib/db/repositories/`)

Mỗi collection có một file repository riêng chứa các hàm truy vấn MongoDB:

| File | Vai trò |
|------|---------|
| `users.ts` | CRUD tài khoản, findByEmail, recordLogin, lockAccount |
| `organizations.ts` | CRUD tổ chức, publish profile |
| `organization-participations.ts` | Liên kết tổ chức ↔ kỳ hội nghị, xác nhận tham gia |
| `summit-editions.ts` | Lấy kỳ hội nghị đang active |
| `summit-registrations.ts` | Tạo/tìm đăng ký thành viên |
| `summit-activities.ts` | CRUD đề xuất, duyệt Topic, duyệt Content, lịch trình |
| `summit-activity-selections.ts` | Thành viên chọn hoạt động tự chọn |
| `summit-activity-attendances.ts` | Staff điểm danh hoạt động |
| `summit-check-ins.ts` | Check-in tại chỗ theo ngày |
| `summit-booth-assignments.ts` | Phân công gian hàng |
| `summit-reports.ts` | Tổng hợp báo cáo cho Staff |
| `scholarships.ts` | CRUD học bổng |
| `partner-showcase.ts` | Quản lý logo đối tác trên trang chủ |
| `audit-logs.ts` | Ghi nhật ký kiểm toán |
| `account-requests.ts` | (Deprecated) |

---

## 6. Server Actions (Luồng xử lý logic)

Server Actions nằm trong `src/app/actions/`. Tất cả đều được đánh dấu `"use server"` và gọi guard phân quyền đầu tiên.

### 6.1 `auth-actions.ts` — Quản lý tài khoản

| Hàm | Quyền | Mô tả |
|-----|-------|-------|
| `registerMemberAction(formData)` | Công khai | Đăng ký tài khoản MEMBER mới. Role được hardcode = MEMBER. |
| `updateMemberProfileAction(formData)` | MEMBER | Cập nhật loại thành viên, số điện thoại, MSSV |
| `createPartnerAccountAction(formData)` | ADMIN | Tạo tài khoản PARTNER + Organization trong một transaction MongoDB. Trả về mật khẩu tạm thời một lần. |
| `resetPartnerTemporaryPasswordAction(userId)` | ADMIN | Đặt lại mật khẩu tạm cho Partner |
| `createStaffAccountAction(formData)` | ADMIN | Tạo tài khoản SUMMIT_STAFF |
| `resetStaffTemporaryPasswordAction(userId)` | ADMIN | Đặt lại mật khẩu tạm cho Staff |
| `changePasswordAction(formData)` | User đăng nhập | Đổi mật khẩu (xác minh mật khẩu cũ trước) |
| `toggleUserStatusAction(userId, newStatus)` | ADMIN | Khóa/mở khóa tài khoản |

### 6.2 `activity-actions.ts` — Quản lý đề xuất Workshop/Biểu diễn

| Hàm | Quyền | Mô tả |
|-----|-------|-------|
| `createActivityDraftAction(type, scopeData)` | PARTNER | Tạo đề xuất mới (Workshop hoặc Biểu diễn) ở trạng thái DRAFT |
| `submitTopicProposalAction(activityId, formData)` | PARTNER | Giai đoạn A: Nộp Topic Proposal cho Workshop |
| `reviewTopicProposalAction(activityId, decision, feedback)` | ADMIN | Admin duyệt/yêu cầu sửa Topic Proposal |
| `saveActivityDraftAction(activityId, formData)` | PARTNER | Lưu bản nháp nội dung đề xuất |
| `submitActivityForReviewAction(activityId, formData)` | PARTNER | Giai đoạn B: Nộp nội dung đầy đủ để Admin duyệt |
| `requestActivityChangesAction(activityId, feedback)` | ADMIN | Yêu cầu Partner chỉnh sửa |
| `approveActivityContentAction(activityId)` | ADMIN | Phê duyệt nội dung cuối cùng |

**Validation bảo mật trong `activity-actions.ts`:**
- Kiểm tra URL an toàn (chỉ `http://` hoặc `https://`)
- Xác minh ảnh Cloudinary (đúng folder namespace, định dạng, kích thước ≤8MB)
- Sanitize HTML qua `sanitizeHtml()` trước khi lưu
- Kiểm tra `isParticipationConfirmed` — tổ chức phải được xác nhận tham gia

### 6.3 `registration-actions.ts` — Đăng ký Summit

| Hàm | Quyền | Mô tả |
|-----|-------|-------|
| `registerForSummitAction(formData)` | MEMBER | Đăng ký tham dự kỳ Summit đang active. Xử lý race condition E11000. |
| `getMemberRegistrationStatusAction()` | MEMBER | Kiểm tra trạng thái đăng ký của thành viên |

### 6.4 `staff-actions.ts` — Vận hành sự kiện

| Hàm | Quyền | Mô tả |
|-----|-------|-------|
| `checkInParticipantAction(registrationId, dayKey)` | ADMIN/STAFF | Check-in người tham dự theo ngày |
| `saveBoothAssignmentDraftAction(orgId, formData)` | ADMIN/STAFF | Lưu bản nháp phân công gian hàng |
| `publishBoothAssignmentAction(boothAssignmentId)` | ADMIN/STAFF | Công bố thông tin gian hàng |
| `saveActivityScheduleAction(activityId, ...)` | ADMIN/STAFF | Lưu lịch trình cho hoạt động. Kiểm tra xung đột thời gian/phòng/slot. |
| `publishActivityScheduleAction(activityId)` | ADMIN/STAFF | Công bố lịch trình hoạt động |

### 6.5 Các actions khác

| File | Mô tả |
|------|-------|
| `scholarship-actions.ts` | Partner tạo/sửa học bổng; Admin duyệt |
| `partner-actions.ts` | Partner cập nhật hồ sơ tổ chức, nộp duyệt |
| `activity-selection-actions.ts` | Member đăng ký tham dự workshop/biểu diễn tự chọn |
| `activity-attendance-actions.ts` | Staff xác nhận điểm danh Member tại hoạt động |
| `upload-actions.ts` | Lấy upload signature từ Cloudinary (client-side upload) |
| `showcase-actions.ts` | Admin quản lý logo đối tác trên trang chủ |

---

## 7. API Routes

### `src/app/api/auth/[...nextauth]/route.ts`

Xử lý tất cả request của NextAuth (đăng nhập, đăng xuất, lấy session). Chỉ re-export `handlers` từ `src/auth.ts`.

### `src/app/api/public/partners/route.ts`

API công khai trả về danh sách đối tác đã được duyệt (`isPublished = true`). Dùng cho PartnerShowcaseMarquee.

### `src/app/api/public/scholarships/route.ts`

API công khai trả về học bổng đã được duyệt. Dùng cho ScholarshipsSection.

### `src/app/api/public/showcase/route.ts`

API công khai trả về danh sách logo showcase của đối tác.

### `src/app/api/staff/reports/[type]/route.ts`

API xuất báo cáo Excel cho nhân viên (registrations, check-ins, activities...).

---

## 8. Cấu trúc trang (App Router)

### 8.1 Trang chủ công khai

```
src/app/[locale]/page.tsx   →   https://fpticosummit.com/{en|vi}
```

Trang một trang (single-page) với anchor navigation. Thứ tự các section:

1. `SiteHeader` — Thanh điều hướng
2. `HeroSection` — Banner chính
3. `StatsStrip` — Số liệu sự kiện
4. `PartnerShowcaseMarquee` — Cuộn logo đối tác
5. `PillarsSection` — 4 trụ cột sự kiện
6. `ExperienceGrid` — Lưới trải nghiệm
7. `ProgramOverview` — Tổng quan chương trình
8. `ExpoSection` — Khu triển lãm
9. `WorkshopSection` — Workshops
10. `PartnersSection` — Đối tác đã xác nhận
11. `PackagesSection` — Các gói tham gia
12. `ScholarshipsSection` — Học bổng
13. `MekongSection` — Trải nghiệm Mekong
14. `VenueSection` — Địa điểm
15. `SouvenirSection` — Quà lưu niệm
16. `FaqSection` — Câu hỏi thường gặp
17. `RegistrationCta` — Kêu gọi đăng ký
18. `SiteFooter` — Chân trang

### 8.2 Dashboard Thành viên (`/[locale]/dashboard/`)

| Route | Mô tả |
|-------|-------|
| `/dashboard` | Trang tổng quan (kiểm tra profile, trạng thái đăng ký) |
| `/dashboard/registration` | Đăng ký tham dự Summit |
| `/dashboard/activities` | Duyệt danh sách hoạt động tự chọn |
| `/dashboard/activities/[id]` | Chi tiết hoạt động |
| `/dashboard/my-activities` | Hoạt động đã đăng ký của tôi |
| `/dashboard/scholarships` | Danh sách học bổng |
| `/dashboard/scholarships/[id]` | Chi tiết học bổng |
| `/dashboard/organization` | Quản lý hồ sơ tổ chức (Partner) |

### 8.3 Cổng Admin (`/[locale]/admin/(protected)/`)

| Route | Mô tả |
|-------|-------|
| `/admin/login` | Đăng nhập Admin |
| `/admin` | Dashboard tổng quan |
| `/admin/users` | Quản lý người dùng |
| `/admin/account-requests` | (Deprecated) Yêu cầu tài khoản |
| `/admin/registrations` | Danh sách đăng ký |
| `/admin/activities` | Danh sách đề xuất hoạt động |
| `/admin/activities/[id]` | Chi tiết duyệt đề xuất |
| `/admin/scholarships` | Quản lý học bổng |
| `/admin/partner-content` | Duyệt hồ sơ đối tác |
| `/admin/showcase` | Quản lý logo showcase |

### 8.4 Cổng Nhân viên (`/[locale]/staff/(protected)/`)

| Route | Mô tả |
|-------|-------|
| `/staff/login` | Đăng nhập Nhân viên |
| `/staff` | Dashboard nhân viên |
| `/staff/check-in` | Check-in người tham dự |
| `/staff/attendance` | Điểm danh hoạt động |
| `/staff/attendance/[id]` | Chi tiết điểm danh hoạt động |
| `/staff/booths` | Quản lý gian hàng |
| `/staff/scheduling` | Lên lịch trình hoạt động |
| `/staff/reports` | Xuất báo cáo |

### 8.5 Xác thực (`/[locale]/`)

| Route | Mô tả |
|-------|-------|
| `/login` | Đăng nhập Member/Partner |
| `/register` | Đăng ký tài khoản mới (Member) |
| `/request-account` | (Deprecated) Yêu cầu tài khoản |
| `/account/change-password` | Đổi mật khẩu |

---

## 9. Components

### 9.1 Layout (`src/components/layout/`)

| File | Mô tả |
|------|-------|
| `SiteHeader.tsx` | Thanh điều hướng chính với Language Switcher và nút đăng nhập/đăng xuất |
| `SiteFooter.tsx` | Chân trang với thông tin liên hệ và links |
| `ClientAuthControl.tsx` | Client component xử lý trạng thái auth (đăng nhập/xuất) |

### 9.2 Sections trang chủ (`src/components/sections/`)

Mỗi component nhận `{ locale, dict }` và render một phần của trang chủ:

| File | Nội dung hiển thị |
|------|------------------|
| `HeroSection.tsx` | Banner chính với CTA đăng ký |
| `StatsStrip.tsx` | Số liệu: số nước, trường ĐH, workshop, v.v. |
| `PartnerShowcaseMarquee.tsx` | Cuộn logo đối tác (API công khai) |
| `PillarsSection.tsx` | 4 trụ cột: Education, Culture, Network, Innovation |
| `ExperienceGrid.tsx` | Lưới hình ảnh trải nghiệm |
| `ProgramOverview.tsx` | Lịch trình 3 ngày |
| `ExpoSection.tsx` | Khu triển lãm đối tác |
| `WorkshopSection.tsx` | Giới thiệu workshops |
| `PartnersSection.tsx` | Đối tác đã xác nhận (status=confirmed) |
| `PackagesSection.tsx` | Các gói tham gia từ `src/data/packages.ts` |
| `ScholarshipsSection.tsx` | Học bổng từ API |
| `MekongSection.tsx` | Trải nghiệm văn hóa Mekong |
| `VenueSection.tsx` | Địa điểm + link 360 tour |
| `SouvenirSection.tsx` | Quà lưu niệm |
| `FaqSection.tsx` | FAQ từ `src/data/faq.ts` |
| `RegistrationCta.tsx` | Nút đăng ký (link Google Form hoặc trang đăng ký) |

### 9.3 UI Components (`src/components/ui/`)

| File | Mô tả |
|------|-------|
| `CountUpNumber.tsx` | Số đếm lên có animation (dùng trong StatsStrip) |
| `LanguageSwitcher.tsx` | Chuyển ngôn ngữ EN/VI |
| `MediaPlaceholder.tsx` | Placeholder khi thiếu ảnh (không vỡ layout) |
| `RevealOnScroll.tsx` | Animation xuất hiện khi cuộn trang |
| `RichTextEditor.tsx` | Editor văn bản phong phú (Client component) |
| `SafeHtml.tsx` | Render HTML đã được sanitize an toàn |
| `SectionHeading.tsx` | Tiêu đề section dùng chung |

### 9.4 Auth Components (`src/components/auth/`)

| File | Mô tả |
|------|-------|
| `LoginForm.tsx` | Form đăng nhập (email + password) |
| `RegisterForm.tsx` | Form đăng ký Member mới |
| `RequestAccountForm.tsx` | (Deprecated) Form yêu cầu tài khoản |
| `ChangePasswordForm.tsx` | Form đổi mật khẩu |

### 9.5 Admin Components (`src/components/admin/`)

| File | Mô tả |
|------|-------|
| `AdminShell.tsx` | Layout wrapper cho cổng Admin |
| `AdminSidebar.tsx` | Thanh điều hướng bên trái Admin |
| `AdminTopBar.tsx` | Thanh trên Admin (tên người dùng, đăng xuất) |
| `AdminLoginForm.tsx` | Form đăng nhập Admin |
| `AdminUsersList.tsx` | Danh sách tài khoản người dùng |
| `AdminRegistrationList.tsx` | Danh sách đăng ký Summit |
| `AdminActivityList.tsx` | Danh sách đề xuất Workshop/Biểu diễn |
| `AdminActivityReviewDetail.tsx` | Chi tiết duyệt đề xuất |
| `AdminScholarshipReviewList.tsx` | Danh sách học bổng cần duyệt |
| `AdminPartnerReviewList.tsx` | Danh sách hồ sơ đối tác cần duyệt |
| `AdminRequestsList.tsx` | (Deprecated) |
| `CreatePartnerModal.tsx` | Modal tạo tài khoản đối tác |
| `AdminCreateStaffModal.tsx` | Modal tạo tài khoản nhân viên |
| `ShowcaseManagementClient.tsx` | Quản lý logo showcase |

### 9.6 Partner Components (`src/components/partner/`)

| File | Mô tả |
|------|-------|
| `OrganizationEditorForm.tsx` | Chỉnh sửa hồ sơ tổ chức |
| `ActivityProposalList.tsx` | Danh sách đề xuất hoạt động của Partner |
| `WorkshopEditorForm.tsx` | Form chỉnh sửa đề xuất Workshop |
| `WorkshopScopeSelector.tsx` | Chọn Track & Topic cho Workshop |
| `PerformanceEditorForm.tsx` | Form chỉnh sửa đề xuất Biểu diễn |
| `PerformanceScopeSelector.tsx` | Chọn phạm vi Biểu diễn |
| `PartnerScholarshipList.tsx` | Danh sách học bổng của Partner |
| `ScholarshipEditorForm.tsx` | Form tạo/sửa học bổng |

### 9.7 Member Components (`src/components/member/`)

| File | Mô tả |
|------|-------|
| `MemberProfileCompletionForm.tsx` | Hoàn thiện hồ sơ thành viên |
| `SummitRegistrationForm.tsx` | Form đăng ký Summit |
| `MemberActivityBrowser.tsx` | Duyệt danh sách hoạt động tự chọn |
| `MemberActivityCard.tsx` | Card hiển thị một hoạt động |
| `MemberActivityDetailModal.tsx` | Modal chi tiết hoạt động |
| `MemberActivitySelectionSummary.tsx` | Tóm tắt hoạt động đã đăng ký |

### 9.8 Staff Components (`src/components/staff/`)

| File | Mô tả |
|------|-------|
| `StaffShell.tsx` | Layout wrapper cổng nhân viên |
| `StaffNavTabs.tsx` | Tab điều hướng nhân viên |
| `StaffCheckInConsole.tsx` | Giao diện check-in (tìm kiếm, quét mã) |
| `StaffWalkInSearchModal.tsx` | Modal tìm kiếm người tham dự |
| `StaffBoothManager.tsx` | Quản lý gian hàng đối tác |
| `StaffSchedulingConsole.tsx` | Lên lịch trình hoạt động |
| `StaffActivityAttendanceConsole.tsx` | Điểm danh hoạt động |
| `StaffActivityAttendanceDetail.tsx` | Chi tiết điểm danh từng hoạt động |
| `StaffAttendanceParticipantTable.tsx` | Bảng danh sách người tham dự hoạt động |
| `StaffReportsConsole.tsx` | Xuất báo cáo Excel |

---

## 10. Dữ liệu tĩnh (Data Layer)

Các file trong `src/data/` chứa dữ liệu **không có backend** — thay đổi trực tiếp trong code:

| File | Nội dung |
|------|---------|
| `site.ts` | Cấu hình sự kiện: tên, ngày, địa điểm, email, links mạng xã hội, URL đăng ký |
| `images.ts` | Tập trung toàn bộ Cloudinary URLs của hình ảnh |
| `program.ts` | Lịch trình 3 ngày sự kiện |
| `partners.ts` | Danh sách đối tác (với `status: "confirmed" | "pending" | "invited" | "hidden"`) |
| `faq.ts` | Câu hỏi thường gặp (FAQ) |
| `packages.ts` | Các gói tham gia |
| `scholarships.ts` | Học bổng hiển thị trên trang chủ (static) |
| `workshops.ts` | Danh sách workshop giới thiệu (static) |
| `expo.ts` | Thông tin khu triển lãm |
| `consulates.ts` | Danh sách lãnh sự quán |
| `universities.ts` | Danh sách đại học |

> **Quy tắc:** Chỉ render `status === "confirmed"` trên UI công khai. Không bao giờ hiển thị đối tác `pending/invited`.

---

## 11. Đa ngôn ngữ (i18n)

### Cấu hình (`src/i18n/config.ts`)

- **Ngôn ngữ hỗ trợ:** `["en", "vi"]`
- **Ngôn ngữ mặc định:** `"en"`
- **Hàm kiểm tra:** `isValidLocale(locale: string): locale is Locale`

### Cách hoạt động

1. URL có dạng `/{locale}/...` (ví dụ: `/vi/`, `/en/`)
2. Page component nhận `params.locale` từ URL
3. Gọi `getDictionary(locale)` để lấy object chứa toàn bộ văn bản
4. Truyền `{ locale, dict }` xuống các component con

### Các file từ điển

- `src/i18n/dictionaries/en.ts` — Toàn bộ văn bản tiếng Anh
- `src/i18n/dictionaries/vi.ts` — Toàn bộ văn bản tiếng Việt
- `src/i18n/get-dictionary.ts` — Hàm `getDictionary(locale)` trả về dictionary đúng ngôn ngữ
- `src/i18n/types.ts` — TypeScript types cho dictionary

---

## 12. Thư viện tiện ích (Utils & Config)

### `src/lib/utils/sanitizer.ts`

Bộ lọc HTML phía server, **không phụ thuộc thư viện ngoài**:

- **Hàm chính:** `sanitizeHtml(input)` — lọc HTML an toàn trước khi lưu vào DB
- **Tags cho phép:** `<p>`, `<strong>`, `<em>`, `<u>`, `<ul>`, `<ol>`, `<li>`, `<a>`, `<h3>`, `<h4>`, `<br>`
- **Loại bỏ:** `<script>`, `<style>`, `<iframe>`, `<svg>`, event handlers, `javascript:`, `data:`, `file:`
- **Link an toàn:** Chỉ cho phép `http://` hoặc `https://`, tự thêm `target="_blank" rel="noopener noreferrer"`
- **Hàm phụ:** `escapeHtml(str)` — escape ký tự HTML đặc biệt

### `src/lib/utils/csv-utils.ts` & `xlsx-utils.ts`

Tạo báo cáo CSV/Excel cho Staff (xuất danh sách đăng ký, check-in...).

### `src/lib/utils/date-helpers.ts`

Tiện ích xử lý ngày tháng (format ngày, so sánh, v.v.).

### `src/lib/utils/edition-utils.ts`

- `isValidDayKey(dayKey, edition)` — Kiểm tra `dayKey` ("2026-11-20") có thuộc kỳ hội nghị không

### `src/lib/utils/member-dto.ts`

Chuyển đổi dữ liệu Member từ DB sang dạng an toàn để hiển thị.

### `src/lib/config/workshop-tracks.ts`

Định nghĩa **6 Workshop Track** với tổng cộng 60+ suggested topics:

| Track | Đối tượng đề xuất |
|-------|------------------|
| `STUDY_ABROAD_SCHOLARSHIPS` | Đại học, Lãnh sự |
| `INTERNATIONAL_MOBILITY_EXCHANGE` | Đại học |
| `AI_EDUCATION_FUTURE_CAREERS` | Đại học |
| `TECHNOLOGY_INNOVATION` | Đại học |
| `GLOBAL_COMPETENCIES_CROSS_CULTURAL` | Đại học |
| `INDUSTRY_EMPLOYABILITY` | Đại học |

**Hàm tiện ích:**
- `getTrackById(trackId)` — Lấy thông tin track theo ID
- `getTopicById(trackId, topicId)` — Lấy thông tin topic cụ thể

### `src/lib/config/performance-scopes.ts`

Định nghĩa phạm vi biểu diễn sân khấu.

### `src/lib/config/workshop-slots.ts`

**20 Workshop Slots** được đặt sẵn cho lịch trình. Mỗi slot có `slotId`, `dateKey`, `startTime`, `endTime`.

- **Hàm:** `getWorkshopSlotById(workshopSlotId)` — Lấy thông tin slot
- **Kiểm tra xung đột:** Mỗi slot chỉ được gán cho một Workshop (Server Action kiểm tra trước khi lưu)

### `src/lib/config/ics-rules.ts`

Quy tắc tham chiếu ICS (International Cooperation System):
- **STU03:** +10 điểm/buổi cho sinh viên FPT Can Tho tham gia hoạt động quốc tế
- **Lưu ý:** Đây là **tham chiếu** — tính điểm chính thức do hệ thống SRO bên ngoài thực hiện

---

## 13. Scripts quản trị

Các script trong `scripts/` chạy bằng `node`:

| Script | Lệnh | Mô tả |
|--------|------|-------|
| `init-mongodb.mjs` | `node scripts/init-mongodb.mjs` | Tạo collections, indexes, Summit Edition đầu tiên |
| `create-admin.mjs` | `node scripts/create-admin.mjs` | Tạo tài khoản ADMIN đầu tiên |
| `test-mongodb.mjs` | `node scripts/test-mongodb.mjs` | Kiểm tra kết nối MongoDB |
| `diagnose-auth.mjs` | `node scripts/diagnose-auth.mjs` | Chẩn đoán sự cố xác thực (tìm user, kiểm tra hash) |
| `test-sanitizer.mjs` | `node scripts/test-sanitizer.mjs` | Kiểm tra bộ lọc HTML |

---

## 14. Cấu hình môi trường

File `.env.local` (dựa theo `.env.example`):

```env
# MongoDB
MONGODB_URI=mongodb+srv://...         # URI kết nối MongoDB Atlas
MONGODB_DB_NAME=fpt_ico_summit        # Tên database (tùy chọn)

# NextAuth
AUTH_SECRET=...                        # Secret key JWT (bắt buộc, dài ≥32 ký tự)
NEXTAUTH_URL=http://localhost:3000     # URL gốc của app

# Cloudinary
CLOUDINARY_CLOUD_NAME=dvucotc8z
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_ACTIVITY_IMAGE_PRESET=fpt_ico_activity_image
```

### Cấu hình Next.js (`next.config.ts`)

- **Ảnh Cloudinary:** Chỉ cho phép từ `res.cloudinary.com/dvucotc8z/**`
- **Security headers (tất cả routes):**
  - `X-Frame-Options: DENY` — Chống clickjacking
  - `X-Content-Type-Options: nosniff` — Chống MIME sniffing
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-DNS-Prefetch-Control: on`
- **Windows dev:** Giới hạn CPU=1, tắt worker threads (tránh crash Node.js 24 trên Windows)

---

## 15. Sơ đồ luồng dữ liệu chính

### Luồng đăng nhập

```
Browser → POST /api/auth/callback/credentials
        → NextAuth authorize()
        → findUserByEmail() [MongoDB]
        → verifyPassword() [scrypt]
        → recordSuccessfulLogin() [MongoDB]
        → JWT token (role, organizationId, mustChangePassword)
        → session cookie
```

### Luồng Partner nộp Workshop (Giai đoạn A)

```
Partner Dashboard
  → submitTopicProposalAction(activityId, formData)
  → requirePartner() [guard kiểm tra MongoDB]
  → isParticipationConfirmed() [tổ chức đã xác nhận tham gia?]
  → getTrackById() [validate track & topic]
  → updateActivityDraft() [lưu snapshot]
  → submitTopicProposal() [cập nhật topicReviewStatus = "IN_REVIEW"]
  → createAuditEntry() [ghi log]
  → [Admin nhận thông báo]
```

### Luồng Admin duyệt & Staff lên lịch

```
Admin
  → approveActivityContentAction()
  → approveActivityContent() [isContentApproved = true, copy draft → approved snapshot]

Staff
  → saveActivityScheduleAction(activityId, dateKey, slot, venue)
  → checkWorkshopSlotConflict() [kiểm tra slot đã có người dùng chưa]
  → checkScheduleConflict() [kiểm tra xung đột phòng/thời gian]
  → updateActivityScheduleDraft() [lưu scheduleDraft]
  → publishActivityScheduleAction()
  → publishActivitySchedule() [copy draft → publishedSchedule, visible to Partner/Member]
```

### Luồng Member đăng ký Summit

```
Member Dashboard
  → registerForSummitAction(formData)
  → requireMember() [guard]
  → getActiveSummitEdition() [có kỳ đang mở không?]
  → findRegistrationByEditionAndUser() [đã đăng ký chưa?]
  → createSummitRegistration() [trong MongoDB transaction]
  → createAuditEntry()
  → Confirmation hiển thị cho Member
```

### Luồng check-in sự kiện

```
Staff (màn hình check-in)
  → Tìm kiếm theo tên/email/MSSV
  → checkInParticipantAction(registrationId, dayKey)
  → requireSummitOperationsAccess() [ADMIN hoặc STAFF]
  → isValidDayKey() [ngày hợp lệ trong kỳ hội nghị?]
  → findCheckIn() [đã check-in hôm nay chưa?]
  → createCheckIn() [tạo bản ghi check-in]
  → createAuditEntry()
  → Xác nhận check-in thành công
```

---

## Phụ lục: Quy ước đặt tên

| Pattern | Ý nghĩa |
|---------|---------|
| `*Action(...)` | Server Action (có `"use server"`, được gọi từ client/server) |
| `require*()` | Authorization guard (ném lỗi nếu không có quyền) |
| `find*()` | Truy vấn đọc MongoDB (trả về document hoặc null) |
| `create*()` | Tạo document mới trong MongoDB |
| `update*()` | Cập nhật document trong MongoDB |
| `get*()` | Lấy config/dữ liệu tĩnh |
| `*Snapshot` | Bản sao dữ liệu tại một thời điểm (immutable khi đã lưu) |
| `*Draft` | Bản nháp đang chỉnh sửa |

---

*Tài liệu này được tổng hợp từ toàn bộ source code dự án. Cập nhật khi có thay đổi kiến trúc lớn.*
