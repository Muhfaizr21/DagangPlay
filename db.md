Buatkan Prisma Schema lengkap untuk platform SaaS voucher 
& top up games bernama "DagangPlay" menggunakan PostgreSQL.

Platform ini adalah:
1. Toko resmi DagangPlay (jualan langsung ke customer)
2. Platform SaaS (merchant bisa buka toko sendiri)

Stack: NestJS + Prisma + PostgreSQL + Redis + Tripay + Digiflazz

=== ARSITEKTUR BISNIS ===

Role hanya 3:
- SUPER_ADMIN → kelola seluruh platform
- MERCHANT    → punya toko, jualan ke customer
- CUSTOMER    → beli produk di toko merchant

Tier harga produk 4 level:
- NORMAL  = harga customer beli di toko resmi DagangPlay
            juga harga modal merchant plan FREE
- PRO     = harga modal merchant plan PRO
- LEGEND  = harga modal merchant plan LEGEND
- SUPREME = harga modal merchant plan SUPREME

Tidak ada reseller, tidak ada MLM, tidak ada downline.
Merchant langsung jualan ke customer.

=== ENUM DEFINITIONS ===

enum Role {
  SUPER_ADMIN
  MERCHANT
  CUSTOMER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  BANNED
}

enum Gender {
  MALE
  FEMALE
}

enum OtpType {
  EMAIL_VERIFY
  PHONE_VERIFY
  RESET_PASSWORD
  LOGIN_2FA
}

enum MerchantStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_REVIEW
}

enum MerchantPlan {
  FREE
  PRO
  LEGEND
  SUPREME
}

enum MerchantMemberRole {
  OWNER
  ADMIN
  STAFF
}

enum SupplierCode {
  DIGIFLAZZ
  VOUCHERKU
  POTATOBOY
  APIGAMES
}

enum SupplierStatus {
  ACTIVE
  INACTIVE
  MAINTENANCE
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  MAINTENANCE
}

enum SkuStatus {
  ACTIVE
  INACTIVE
  EMPTY
}

enum PriceTier {
  NORMAL
  PRO
  LEGEND
  SUPREME
}

enum OrderPaymentStatus {
  PENDING
  PAID
  EXPIRED
  REFUNDED
}

enum OrderFulfillmentStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  REFUNDED
}

enum PaymentMethod {
  BALANCE
  TRIPAY_QRIS
  TRIPAY_VA_BCA
  TRIPAY_VA_BNI
  TRIPAY_VA_BRI
  TRIPAY_VA_MANDIRI
  TRIPAY_VA_PERMATA
  TRIPAY_GOPAY
  TRIPAY_OVO
  TRIPAY_DANA
  TRIPAY_SHOPEEPAY
  TRIPAY_ALFAMART
  TRIPAY_INDOMARET
  MANUAL_TRANSFER
}

enum PaymentStatus {
  PENDING
  PAID
  EXPIRED
  FAILED
  REFUNDED
}

enum FeeType {
  FLAT
  PERCENTAGE
}

enum DepositStatus {
  PENDING
  CONFIRMED
  REJECTED
  EXPIRED
}

enum BalanceTrxType {
  DEPOSIT
  WITHDRAWAL
  PURCHASE
  REFUND
  BONUS
  ADJUSTMENT
}

enum WithdrawalStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
}

enum PromoType {
  DISCOUNT_FLAT
  DISCOUNT_PERCENTAGE
  CASHBACK
}

enum PromoAppliesTo {
  ALL
  CATEGORY
  PRODUCT
}

enum NotificationType {
  ORDER
  PAYMENT
  DEPOSIT
  WITHDRAWAL
  PROMO
  SYSTEM
  ANNOUNCEMENT
  PRICE_CHANGE
  SUPPLIER_STATUS
}

enum NotificationChannel {
  IN_APP
  EMAIL
  WHATSAPP
  SMS
}

enum TicketCategory {
  PAYMENT
  ORDER
  ACCOUNT
  REFUND
  OTHER
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_REPLY
  RESOLVED
  CLOSED
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  JSON
}

enum WebhookEvent {
  ORDER_CREATED
  ORDER_SUCCESS
  ORDER_FAILED
  PAYMENT_PAID
  DEPOSIT_CONFIRMED
  BALANCE_UPDATED
  PRICE_CHANGED
}

enum WebhookStatus {
  PENDING
  SUCCESS
  FAILED
  RETRYING
}

enum FraudRiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum InvoiceStatus {
  UNPAID
  PAID
  OVERDUE
  CANCELLED
}

enum DisputeStatus {
  OPEN
  INVESTIGATING
  RESOLVED
  REJECTED
}

enum JobStatus {
  PENDING
  RUNNING
  SUCCESS
  FAILED
  RETRYING
}

enum BannerPosition {
  HERO
  SIDEBAR
  POPUP
  FOOTER
}

enum ChangeType {
  MANUAL
  SYNC_DIGIFLAZZ
  FORMULA_APPLY
  BULK_UPDATE
}

=== PRISMA SCHEMA LENGKAP ===

// ============================================
// USERS & AUTH
// ============================================

// Master semua user
model User {
  id            String     @id @default(cuid())
  email         String?    @unique
  phone         String?    @unique
  password      String
  name          String
  username      String?    @unique
  avatar        String?
  role          Role       @default(CUSTOMER)
  status        UserStatus @default(ACTIVE)
  isVerified    Boolean    @default(false)
  verifiedAt    DateTime?
  referralCode  String     @unique
  referredById  String?
  referredBy    User?      @relation("UserReferral", fields: [referredById], references: [id])
  referrals     User[]     @relation("UserReferral")
  merchantId    String?    // merchant mana tempat customer terdaftar
  balance       Float      @default(0)
  bonusBalance  Float      @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  deletedAt     DateTime?

  // Relations
  profile              UserProfile?
  sessions             UserSession[]
  otpVerifications     OtpVerification[]
  merchantMemberships  MerchantMember[]
  ownedMerchant        Merchant?             @relation("MerchantOwner")
  orders               Order[]
  balanceTransactions  BalanceTransaction[]
  deposits             Deposit[]
  withdrawals          Withdrawal[]
  promoUsages          PromoUsage[]
  notifications        Notification[]
  supportTickets       SupportTicket[]       @relation("TicketUser")
  assignedTickets      SupportTicket[]       @relation("TicketAssigned")
  ticketReplies        SupportTicketReply[]
  productReviews       ProductReview[]
  auditLogs            AuditLog[]
  apiKeys              ApiKey[]
  trustedDevices       DeviceTrusted[]
  loginAttempts        LoginAttempt[]
  fraudDetections      FraudDetection[]
  userFavorites        UserFavorite[]
  userActivityLogs     UserActivityLog[]
  merchantProductPrices MerchantProductPrice[]
  emailCampaignLogs    EmailCampaignLog[]
  pushNotifLogs        PushNotificationLog[]
  confirmedDeposits    Deposit[]             @relation("DepositConfirmedBy")
  processedWithdrawals Withdrawal[]          @relation("WithdrawalProcessedBy")

  @@index([email, phone, role, status, merchantId])
}

// Profil lengkap user
model UserProfile {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName          String?
  birthDate         DateTime?
  gender            Gender?
  address           String?
  city              String?
  province          String?
  postalCode        String?
  idCardNumber      String?
  bankName          String?
  bankAccountNumber String?
  bankAccountName   String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

// Session login aktif
model UserSession {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String   @unique
  refreshToken String   @unique
  ipAddress    String?
  userAgent    String?
  device       String?
  expiresAt    DateTime
  lastActiveAt DateTime @default(now())
  createdAt    DateTime @default(now())

  @@index([userId, token])
}

// OTP verifikasi
model OtpVerification {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      OtpType
  code      String
  token     String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([userId, token, type])
}

// ============================================
// KEAMANAN & ANTI-FRAUD
// ============================================

// Blacklist IP berbahaya
model IPBlacklist {
  id        String    @id @default(cuid())
  ipAddress String    @unique
  reason    String
  blockedBy String
  expiresAt DateTime?
  createdAt DateTime  @default(now())

  @@index([ipAddress])
}

// Deteksi transaksi mencurigakan
model FraudDetection {
  id         String         @id @default(cuid())
  userId     String
  user       User           @relation(fields: [userId], references: [id])
  orderId    String?
  order      Order?         @relation(fields: [orderId], references: [id])
  riskLevel  FraudRiskLevel
  reason     String
  metadata   Json?
  isResolved Boolean        @default(false)
  resolvedBy String?
  resolvedAt DateTime?
  createdAt  DateTime       @default(now())

  @@index([userId, riskLevel, isResolved])
}

// Track percobaan login
model LoginAttempt {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  ipAddress  String
  userAgent  String?
  email      String?
  isSuccess  Boolean
  failReason String?
  createdAt  DateTime @default(now())

  @@index([userId, ipAddress, isSuccess, createdAt])
}

// Whitelist device terpercaya
model DeviceTrusted {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  deviceId   String
  deviceName String?
  userAgent  String?
  ipAddress  String?
  trustedAt  DateTime  @default(now())
  expiresAt  DateTime?

  @@unique([userId, deviceId])
  @@index([userId])
}

// Rate limiting per endpoint
model ApiRateLimit {
  id          String   @id @default(cuid())
  userId      String?
  ipAddress   String
  endpoint    String
  hitCount    Int      @default(1)
  windowStart DateTime
  windowEnd   DateTime
  isBlocked   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, ipAddress, endpoint, windowStart])
}

// ============================================
// MERCHANT / TENANT
// ============================================

// Data merchant berlangganan SaaS
model Merchant {
  id              String         @id @default(cuid())
  name            String
  slug            String         @unique
  logo            String?
  favicon         String?
  bannerImage     String?
  domain          String?        @unique
  description     String?
  tagline         String?
  contactEmail    String?
  contactPhone    String?
  contactWhatsapp String?
  address         String?
  city            String?
  province        String?
  status          MerchantStatus @default(PENDING_REVIEW)
  plan            MerchantPlan   @default(FREE)
  planExpiredAt   DateTime?

  // true = toko resmi DagangPlay sendiri
  // false = merchant/mitra berlangganan
  isOfficial      Boolean        @default(false)

  settings        Json?          // kustomisasi tema, fitur aktif dll
  ownerId         String         @unique
  owner           User           @relation("MerchantOwner", fields: [ownerId], references: [id])
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?

  // Relations
  members               MerchantMember[]
  orders                Order[]
  deposits              Deposit[]
  notifications         Notification[]
  supportTickets        SupportTicket[]
  auditLogs             AuditLog[]
  apiKeys               ApiKey[]
  webhookEndpoints      WebhookEndpoint[]
  merchantProductPrices MerchantProductPrice[]
  promoCodes            PromoCode[]
  paymentChannels       PaymentChannel[]
  banners               Banner[]
  announcements         Announcement[]
  popupPromos           PopupPromo[]
  emailCampaigns        EmailCampaign[]
  merchantSettings      MerchantSetting[]
  invoices              Invoice[]
  subscriptionHistories SubscriptionHistory[]
  dailySalesSnapshots   DailySalesSnapshot[]

  @@index([slug, domain, status, plan, isOfficial])
}

// Tim staff merchant
model MerchantMember {
  id          String             @id @default(cuid())
  merchantId  String
  merchant    Merchant           @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  userId      String
  user        User               @relation(fields: [userId], references: [id])
  role        MerchantMemberRole @default(STAFF)
  permissions Json?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  @@unique([merchantId, userId])
  @@index([merchantId, userId])
}

// ============================================
// SUPPLIER & PRODUK
// ============================================

// Data supplier (Digiflazz dll)
model Supplier {
  id         String         @id @default(cuid())
  name       String
  code       SupplierCode   @unique
  apiUrl     String
  apiKey     String
  apiSecret  String
  status     SupplierStatus @default(ACTIVE)
  balance    Float          @default(0)
  lastSyncAt DateTime?
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  productSkus      ProductSku[]
  supplierLogs     SupplierLog[]
  supplierBalances SupplierBalanceHistory[]
  maintenances     MaintenanceSchedule[]
}

// Log semua request/response ke Digiflazz
model SupplierLog {
  id           String    @id @default(cuid())
  supplierId   String
  supplier     Supplier  @relation(fields: [supplierId], references: [id])
  orderId      String?
  order        Order?    @relation(fields: [orderId], references: [id])
  method       String
  endpoint     String
  requestBody  Json?
  responseBody Json?
  httpStatus   Int?
  duration     Int?      // dalam millisecond
  isSuccess    Boolean
  createdAt    DateTime  @default(now())

  @@index([supplierId, orderId, isSuccess, createdAt])
}

// Riwayat saldo di supplier
model SupplierBalanceHistory {
  id            String   @id @default(cuid())
  supplierId    String
  supplier      Supplier @relation(fields: [supplierId], references: [id])
  type          String   // TOP_UP, DEDUCT
  amount        Float
  balanceBefore Float
  balanceAfter  Float
  note          String?
  createdAt     DateTime @default(now())

  @@index([supplierId, createdAt])
}

// Kategori produk (bisa nested)
model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  icon        String?
  image       String?
  description String?
  sortOrder   Int        @default(0)
  isActive    Boolean    @default(true)
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")

  // Mapping ke kategori Digiflazz
  digiflazzCategory String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  products          Product[]
  promoCodes        PromoCode[]
  productSalesStats ProductSalesStats[]
  tierPricingRules  TierPricingRule[]

  @@index([slug, isActive, parentId])
}

// Master produk game
model Product {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  categoryId  String
  category    Category      @relation(fields: [categoryId], references: [id])
  description String?
  thumbnail   String?
  banner      String?

  // Label field input ID game
  // contoh: "User ID", "Player ID", "Email"
  gameIdLabel   String?

  // Apakah perlu input server/zone
  needServer    Boolean @default(false)
  serverLabel   String? // contoh: "Server", "Zone ID"

  // Info dari Digiflazz untuk sinkronisasi
  digiflazzBrand    String?
  digiflazzCategory String?

  instruction String?       // cara top up step by step
  status      ProductStatus @default(ACTIVE)
  sortOrder   Int           @default(0)
  isFeatured  Boolean       @default(false)
  isPopular   Boolean       @default(false)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  skus              ProductSku[]
  reviews           ProductReview[]
  gameServers       GameServer[]
  userFavorites     UserFavorite[]
  productSalesStats ProductSalesStats[]
  maintenances      MaintenanceSchedule[]
  refundPolicy      RefundPolicy?
}

// SKU/varian produk dengan 4 tier harga
// Inti dari koneksi ke Digiflazz
model ProductSku {
  id           String    @id @default(cuid())
  productId    String
  product      Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  supplierId   String
  supplier     Supplier  @relation(fields: [supplierId], references: [id])

  // Nama varian, contoh: "86 Diamond", "172 Diamond"
  name         String

  // Kode produk di Digiflazz (buyer_sku_code)
  supplierCode String

  // Supplier backup jika utama gagal (failover)
  backupSupplierId   String?
  backupSupplierCode String?

  // Harga beli dari Digiflazz
  // TIDAK PERNAH tampil ke merchant/customer
  basePrice    Float

  // Harga jual per tier
  // NORMAL  → customer di toko resmi + merchant FREE
  // PRO     → merchant plan PRO
  // LEGEND  → merchant plan LEGEND
  // SUPREME → merchant plan SUPREME
  priceNormal  Float
  pricePro     Float
  priceLegend  Float
  priceSupreme Float

  // Margin tersimpan untuk referensi cepat (persen)
  marginNormal  Float
  marginPro     Float
  marginLegend  Float
  marginSupreme Float

  stock     Int       @default(-1) // -1 = unlimited
  status    SkuStatus @default(ACTIVE)
  sortOrder Int       @default(0)

  // Data tambahan dari Digiflazz (raw response)
  metadata  Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders                Order[]
  merchantProductPrices MerchantProductPrice[]
  promoCodes            PromoCode[]
  tierPriceHistories    TierPriceHistory[]

  @@index([productId, supplierId, status, supplierCode])
}

// Formula harga otomatis per tier per kategori
// Super Admin set persentase margin, sistem hitung sendiri
model TierPricingRule {
  id         String    @id @default(cuid())
  categoryId String?   // null = berlaku global semua kategori
  category   Category? @relation(fields: [categoryId], references: [id])

  // Persentase margin di atas basePrice
  marginNormal  Float   // contoh: 11.4 berarti 11.4%
  marginPro     Float
  marginLegend  Float
  marginSupreme Float

  // Batas minimum margin
  // Sistem tolak jika harga yang di-set di bawah ini
  minMarginNormal  Float @default(5.0)
  minMarginPro     Float @default(3.0)
  minMarginLegend  Float @default(2.0)
  minMarginSupreme Float @default(1.0)

  isActive  Boolean  @default(true)
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([categoryId, isActive])
}

// Riwayat perubahan harga semua tier
model TierPriceHistory {
  id           String     @id @default(cuid())
  productSkuId String
  productSku   ProductSku @relation(fields: [productSkuId], references: [id])

  // Snapshot harga lama
  oldBasePrice    Float
  oldPriceNormal  Float
  oldPricePro     Float
  oldPriceLegend  Float
  oldPriceSupreme Float

  // Snapshot harga baru
  newBasePrice    Float
  newPriceNormal  Float
  newPricePro     Float
  newPriceLegend  Float
  newPriceSupreme Float

  changeType ChangeType // MANUAL, SYNC_DIGIFLAZZ, FORMULA_APPLY, BULK_UPDATE
  changedBy  String     // userId atau "SYSTEM"
  reason     String?
  createdAt  DateTime   @default(now())

  @@index([productSkuId, changeType, createdAt])
}

// Mapping plan merchant ke tier harga
// Fleksibel: Super Admin bisa ubah kapan saja
// tanpa perlu deploy ulang
// Default:
// FREE    → NORMAL
// PRO     → PRO
// LEGEND  → LEGEND
// SUPREME → SUPREME
model PlanTierMapping {
  id        String       @id @default(cuid())
  plan      MerchantPlan @unique
  tier      PriceTier
  isActive  Boolean      @default(true)
  updatedBy String
  updatedAt DateTime     @updatedAt
}

// Override harga khusus per merchant
// Digunakan Super Admin untuk beri harga spesial
// di luar tier normal (contoh: promo merchant baru)
model MerchantProductPrice {
  id           String     @id @default(cuid())
  merchantId   String
  merchant     Merchant   @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  productSkuId String
  productSku   ProductSku @relation(fields: [productSkuId], references: [id])
  setById      String
  setBy        User       @relation(fields: [setById], references: [id])
  customPrice  Float
  isActive     Boolean    @default(true)
  reason       String?
  expiredAt    DateTime?  // null = tidak ada batas waktu
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([merchantId, productSkuId])
  @@index([merchantId, productSkuId, isActive])
}

// Server/region per game
// Contoh: Mobile Legends punya server 1-999
model GameServer {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  serverId  String
  name      String
  isActive  Boolean @default(true)
  sortOrder Int     @default(0)

  @@unique([productId, serverId])
  @@index([productId])
}

// Log validasi ID game customer
model GameValidation {
  id         String   @id @default(cuid())
  productId  String
  gameUserId String
  serverId   String?
  nickname   String?
  isValid    Boolean
  ipAddress  String?
  checkedAt  DateTime @default(now())

  @@index([productId, gameUserId])
}

// Cache nickname akun game
// Supaya tidak validasi ulang ke API setiap saat
model GameNickname {
  id         String   @id @default(cuid())
  productId  String
  gameUserId String
  serverId   String?
  nickname   String
  cachedAt   DateTime @default(now())
  expiresAt  DateTime

  @@unique([productId, gameUserId, serverId])
  @@index([productId, gameUserId])
}

// ============================================
// ORDER & TRANSAKSI
// ============================================

model Order {
  id          String @id @default(cuid())
  orderNumber String @unique // format: DP-20250101-XXXX
  userId      String
  user        User   @relation(fields: [userId], references: [id])
  merchantId  String
  merchant    Merchant @relation(fields: [merchantId], references: [id])

  productId    String
  productSkuId String
  productSku   ProductSku @relation(fields: [productSkuId], references: [id])

  // Snapshot data saat transaksi
  // Penting: harga & nama produk bisa berubah sewaktu-waktu
  productName    String
  productSkuName String
  priceTierUsed  PriceTier  // tier harga yang dipakai saat transaksi
  basePrice      Float      // harga beli dari supplier saat itu
  sellingPrice   Float      // harga jual ke customer saat itu
  totalPrice     Float      // setelah diskon

  // Data game customer
  gameUserId       String
  gameUserServerId String?
  gameUserName     String?  // nickname yang berhasil divalidasi

  quantity Int @default(1)

  // Promo yang dipakai
  promoCodeId    String?
  promoCode      PromoCode? @relation(fields: [promoCodeId], references: [id])
  discountAmount Float      @default(0)

  // Status pembayaran
  paymentMethod PaymentMethod?
  paymentStatus OrderPaymentStatus @default(PENDING)

  // Status fulfillment ke supplier
  fulfillmentStatus OrderFulfillmentStatus @default(PENDING)
  supplierId        String?
  supplierRefId     String?  // ref_id yang dikirim ke Digiflazz
  supplierResponse  Json?    // full response dari Digiflazz
  serialNumber      String?  // SN dari Digiflazz jika ada

  note       String?
  failReason String?
  paidAt     DateTime?
  processedAt DateTime?
  completedAt DateTime?
  failedAt   DateTime?
  expiredAt  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  payment         Payment?
  statusHistories OrderStatusHistory[]
  fraudDetections FraudDetection[]
  supplierLogs    SupplierLog[]
  balanceTrx      BalanceTransaction[]
  disputeCases    DisputeCase[]

  @@index([userId, merchantId, paymentStatus, fulfillmentStatus, createdAt])
}

// Riwayat perubahan status order
model OrderStatusHistory {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    String
  note      String?
  changedBy String   // userId atau "SYSTEM"
  createdAt DateTime @default(now())

  @@index([orderId, createdAt])
}

// ============================================
// PEMBAYARAN VIA TRIPAY
// ============================================

model Payment {
  id         String @id @default(cuid())
  orderId    String @unique
  order      Order  @relation(fields: [orderId], references: [id])
  userId     String
  merchantId String

  method      PaymentMethod
  amount      Float
  fee         Float         @default(0) // biaya Tripay
  totalAmount Float         // amount + fee

  status PaymentStatus @default(PENDING)

  // Data dari Tripay
  tripayReference   String?   // nomor referensi dari Tripay
  tripayMerchantRef String?   // ref yang kita kirim ke Tripay
  tripayPaymentUrl  String?   // URL halaman pembayaran
  tripayQrUrl       String?   // URL QR code jika QRIS
  tripayVaNumber    String?   // nomor Virtual Account
  tripayExpiredTime DateTime? // batas waktu bayar
  tripayResponse    Json?     // full response Tripay

  paidAt    DateTime?
  expiredAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId, userId, merchantId, status, tripayReference])
}

// Konfigurasi channel payment per merchant
model PaymentChannel {
  id         String        @id @default(cuid())
  merchantId String?       // null = setting global
  merchant   Merchant?     @relation(fields: [merchantId], references: [id])
  method     PaymentMethod
  name       String
  icon       String?
  fee        Float         @default(0)
  feeType    FeeType       @default(FLAT)
  minAmount  Float?
  maxAmount  Float?
  isActive   Boolean       @default(true)
  sortOrder  Int           @default(0)
  tripayConfig Json?       // konfigurasi Tripay jika per merchant
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@index([merchantId, method, isActive])
}

// ============================================
// SALDO & DEPOSIT
// ============================================

// Pengajuan deposit saldo
model Deposit {
  id         String        @id @default(cuid())
  userId     String
  user       User          @relation(fields: [userId], references: [id])
  merchantId String
  merchant   Merchant      @relation(fields: [merchantId], references: [id])
  amount     Float
  method     PaymentMethod
  status     DepositStatus @default(PENDING)

  // Data Tripay untuk deposit via payment gateway
  tripayReference   String?
  tripayMerchantRef String?
  tripayPaymentUrl  String?
  tripayVaNumber    String?
  tripayQrUrl       String?
  tripayResponse    Json?
  tripayExpiredTime DateTime?

  // Jika deposit manual transfer
  receiptImage  String?
  confirmedById String?
  confirmedBy   User?    @relation("DepositConfirmedBy", fields: [confirmedById], references: [id])
  confirmedAt   DateTime?
  rejectedAt    DateTime?
  note          String?
  expiredAt     DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  balanceTransaction BalanceTransaction?

  @@index([userId, merchantId, status, createdAt])
}

// Mutasi saldo (semua transaksi keluar masuk saldo)
model BalanceTransaction {
  id            String         @id @default(cuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id])
  type          BalanceTrxType
  amount        Float
  balanceBefore Float
  balanceAfter  Float
  orderId       String?
  order         Order?         @relation(fields: [orderId], references: [id])
  depositId     String?        @unique
  deposit       Deposit?       @relation(fields: [depositId], references: [id])
  withdrawalId  String?        @unique
  withdrawal    Withdrawal?    @relation(fields: [withdrawalId], references: [id])
  description   String?
  note          String?
  createdAt     DateTime       @default(now())

  @@index([userId, type, createdAt])
}

// Penarikan saldo ke rekening bank
model Withdrawal {
  id                String           @id @default(cuid())
  userId            String
  user              User             @relation(fields: [userId], references: [id])
  amount            Float
  fee               Float            @default(0)
  netAmount         Float
  bankName          String
  bankAccountNumber String
  bankAccountName   String
  status            WithdrawalStatus @default(PENDING)
  processedById     String?
  processedBy       User?            @relation("WithdrawalProcessedBy", fields: [processedById], references: [id])
  processedAt       DateTime?
  rejectedAt        DateTime?
  note              String?
  receiptImage      String?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  balanceTransaction BalanceTransaction?

  @@index([userId, status, createdAt])
}

// ============================================
// PROMO & VOUCHER DISKON
// ============================================

model PromoCode {
  id           String         @id @default(cuid())
  merchantId   String?        // null = promo global dari DagangPlay
  merchant     Merchant?      @relation(fields: [merchantId], references: [id])
  code         String         @unique
  name         String
  description  String?
  type         PromoType
  value        Float
  maxDiscount  Float?
  minPurchase  Float?
  quota        Int?
  usedCount    Int            @default(0)
  startDate    DateTime?
  endDate      DateTime?
  isActive     Boolean        @default(true)
  appliesTo    PromoAppliesTo @default(ALL)
  categoryId   String?
  category     Category?      @relation(fields: [categoryId], references: [id])
  productSkuId String?
  productSku   ProductSku?    @relation(fields: [productSkuId], references: [id])
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  usages PromoUsage[]
  orders Order[]

  @@index([code, merchantId, isActive])
}

// Penggunaan promo per user per order
model PromoUsage {
  id             String    @id @default(cuid())
  promoCodeId    String
  promoCode      PromoCode @relation(fields: [promoCodeId], references: [id])
  userId         String
  user           User      @relation(fields: [userId], references: [id])
  orderId        String
  discountAmount Float
  createdAt      DateTime  @default(now())

  @@unique([promoCodeId, orderId])
  @@index([promoCodeId, userId])
}

// ============================================
// API KEY & WEBHOOK
// ============================================

model ApiKey {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  merchantId  String?
  merchant    Merchant? @relation(fields: [merchantId], references: [id])
  name        String
  key         String    @unique
  secret      String
  permissions Json?
  isActive    Boolean   @default(true)
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, merchantId, key])
}

model WebhookEndpoint {
  id         String   @id @default(cuid())
  merchantId String
  merchant   Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  url        String
  secret     String
  events     Json     // array WebhookEvent
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  logs WebhookLog[]

  @@index([merchantId])
}

model WebhookLog {
  id                String          @id @default(cuid())
  webhookEndpointId String
  webhookEndpoint   WebhookEndpoint @relation(fields: [webhookEndpointId], references: [id])
  event             WebhookEvent
  payload           Json
  responseStatus    Int?
  responseBody      String?
  status            WebhookStatus   @default(PENDING)
  retryCount        Int             @default(0)
  nextRetryAt       DateTime?
  sentAt            DateTime?
  createdAt         DateTime        @default(now())

  @@index([webhookEndpointId, status, event])
}

// ============================================
// KEUANGAN LANJUT
// ============================================

// Invoice subscription SaaS merchant
// Dibayar via Tripay
model Invoice {
  id          String        @id @default(cuid())
  merchantId  String
  merchant    Merchant      @relation(fields: [merchantId], references: [id])
  invoiceNo   String        @unique
  plan        MerchantPlan
  amount      Float
  tax         Float         @default(0)
  totalAmount Float
  status      InvoiceStatus @default(UNPAID)
  dueDate     DateTime

  // Data Tripay untuk bayar invoice
  tripayReference  String?
  tripayPaymentUrl String?
  tripayResponse   Json?

  paidAt    DateTime?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([merchantId, status, dueDate])
}

// Riwayat upgrade/downgrade plan merchant
model SubscriptionHistory {
  id         String        @id @default(cuid())
  merchantId String
  merchant   Merchant      @relation(fields: [merchantId], references: [id])
  oldPlan    MerchantPlan?
  newPlan    MerchantPlan
  startDate  DateTime
  endDate    DateTime
  amount     Float
  note       String?
  createdAt  DateTime      @default(now())

  @@index([merchantId, createdAt])
}

// ============================================
// ANALYTICS & REPORTING
// ============================================

// Snapshot penjualan harian per merchant
model DailySalesSnapshot {
  id            String   @id @default(cuid())
  merchantId    String
  merchant      Merchant @relation(fields: [merchantId], references: [id])
  date          DateTime
  totalOrders   Int      @default(0)
  successOrders Int      @default(0)
  failedOrders  Int      @default(0)
  totalRevenue  Float    @default(0)
  totalProfit   Float    @default(0)
  newCustomers  Int      @default(0)
  createdAt     DateTime @default(now())

  @@unique([merchantId, date])
  @@index([merchantId, date])
}

// Statistik penjualan per produk per hari
model ProductSalesStats {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  categoryId   String
  category     Category @relation(fields: [categoryId], references: [id])
  date         DateTime
  totalSold    Int      @default(0)
  totalRevenue Float    @default(0)
  createdAt    DateTime @default(now())

  @@unique([productId, date])
  @@index([productId, categoryId, date])
}

// Log aktivitas user di platform
model UserActivityLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  page      String?
  metadata  Json?
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([userId, action, createdAt])
}

// ============================================
// NOTIFIKASI
// ============================================

model Notification {
  id         String           @id @default(cuid())
  userId     String
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  merchantId String?
  merchant   Merchant?        @relation(fields: [merchantId], references: [id])
  type       NotificationType
  title      String
  message    String
  imageUrl   String?
  isRead     Boolean          @default(false)
  readAt     DateTime?
  data       Json?
  createdAt  DateTime         @default(now())

  @@index([userId, merchantId, isRead, type, createdAt])
}

model NotificationTemplate {
  id         String              @id @default(cuid())
  merchantId String?             // null = template global
  type       NotificationType
  channel    NotificationChannel
  subject    String?
  body       String              // support variabel {{nama}}, {{orderId}} dll
  isActive   Boolean             @default(true)
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  @@unique([merchantId, type, channel])
}

model PushNotificationLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  body      String
  data      Json?
  isSuccess Boolean
  errorMsg  String?
  sentAt    DateTime @default(now())

  @@index([userId, isSuccess, sentAt])
}

model EmailCampaignLog {
  id         String        @id @default(cuid())
  campaignId String
  campaign   EmailCampaign @relation(fields: [campaignId], references: [id])
  userId     String
  user       User          @relation(fields: [userId], references: [id])
  isSuccess  Boolean
  errorMsg   String?
  sentAt     DateTime      @default(now())

  @@index([campaignId, userId])
}

// ============================================
// MARKETING & KONTEN
// ============================================

model Banner {
  id         String         @id @default(cuid())
  merchantId String?        // null = banner global DagangPlay
  merchant   Merchant?      @relation(fields: [merchantId], references: [id])
  title      String
  image      String
  linkUrl    String?
  position   BannerPosition @default(HERO)
  sortOrder  Int            @default(0)
  startDate  DateTime?
  endDate    DateTime?
  isActive   Boolean        @default(true)
  clickCount Int            @default(0)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  @@index([merchantId, position, isActive])
}

model Announcement {
  id         String    @id @default(cuid())
  merchantId String?
  merchant   Merchant? @relation(fields: [merchantId], references: [id])
  title      String
  content    String
  imageUrl   String?
  isActive   Boolean   @default(true)
  startDate  DateTime?
  endDate    DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([merchantId, isActive])
}

model PopupPromo {
  id         String    @id @default(cuid())
  merchantId String?
  merchant   Merchant? @relation(fields: [merchantId], references: [id])
  title      String
  image      String?
  content    String?
  linkUrl    String?
  startDate  DateTime?
  endDate    DateTime?
  isActive   Boolean   @default(true)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([merchantId, isActive])
}

model EmailCampaign {
  id          String    @id @default(cuid())
  merchantId  String?
  merchant    Merchant? @relation(fields: [merchantId], references: [id])
  name        String
  subject     String
  body        String
  targetRole  Role?
  sentCount   Int       @default(0)
  scheduledAt DateTime?
  sentAt      DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  logs EmailCampaignLog[]

  @@index([merchantId, isActive])
}

model UserFavorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, productId])
  @@index([userId])
}

// ============================================
// SUPPORT TICKET
// ============================================

model SupportTicket {
  id           String         @id @default(cuid())
  userId       String
  user         User           @relation("TicketUser", fields: [userId], references: [id])
  merchantId   String
  merchant     Merchant       @relation(fields: [merchantId], references: [id])
  orderId      String?
  subject      String
  description  String
  category     TicketCategory
  priority     TicketPriority @default(MEDIUM)
  status       TicketStatus   @default(OPEN)
  assignedToId String?
  assignedTo   User?          @relation("TicketAssigned", fields: [assignedToId], references: [id])
  resolvedAt   DateTime?
  closedAt     DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  replies SupportTicketReply[]

  @@index([userId, merchantId, status, priority, createdAt])
}

model SupportTicketReply {
  id          String        @id @default(cuid())
  ticketId    String
  ticket      SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  message     String
  attachments Json?
  isFromStaff Boolean       @default(false)
  createdAt   DateTime      @default(now())

  @@index([ticketId, userId])
}

// ============================================
// REVIEW & RATING
// ============================================

model ProductReview {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  orderId     String   @unique
  rating      Int      // 1-5
  comment     String?
  images      Json?
  isVerified  Boolean  @default(false) // hanya yang pernah beli
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([productId, userId, rating, isPublished])
}

// ============================================
// OPERASIONAL
// ============================================

// Jadwal maintenance produk/supplier
model MaintenanceSchedule {
  id          String    @id @default(cuid())
  supplierId  String?
  supplier    Supplier? @relation(fields: [supplierId], references: [id])
  productId   String?
  product     Product?  @relation(fields: [productId], references: [id])
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([supplierId, productId, startTime, endTime])
}

// Kebijakan refund per produk
model RefundPolicy {
  id           String   @id @default(cuid())
  productId    String   @unique
  product      Product  @relation(fields: [productId], references: [id])
  isRefundable Boolean  @default(true)
  maxHours     Int      @default(24)
  conditions   String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// Kasus sengketa order
model DisputeCase {
  id         String        @id @default(cuid())
  orderId    String
  order      Order         @relation(fields: [orderId], references: [id])
  userId     String
  reason     String
  evidence   Json?
  status     DisputeStatus @default(OPEN)
  resolution String?
  resolvedBy String?
  resolvedAt DateTime?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@index([orderId, userId, status])
}

// Background job queue
model JobQueue {
  id          String    @id @default(cuid())
  type        String    // contoh: PROCESS_ORDER, SEND_NOTIF, SYNC_PRICE
  payload     Json
  status      JobStatus @default(PENDING)
  retryCount  Int       @default(0)
  maxRetry    Int       @default(3)
  error       String?
  scheduledAt DateTime  @default(now())
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime  @default(now())

  @@index([type, status, scheduledAt])
}

// ============================================
// PENGATURAN
// ============================================

model SystemSetting {
  id          String      @id @default(cuid())
  key         String      @unique
  value       String
  type        SettingType @default(STRING)
  description String?
  group       String?
  updatedBy   String?
  updatedAt   DateTime    @updatedAt
}

model MerchantSetting {
  id         String      @id @default(cuid())
  merchantId String
  key        String
  value      String
  type       SettingType @default(STRING)
  updatedAt  DateTime    @updatedAt

  @@unique([merchantId, key])
  @@index([merchantId])
}

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id         String    @id @default(cuid())
  userId     String?
  user       User?     @relation(fields: [userId], references: [id])
  merchantId String?
  merchant   Merchant? @relation(fields: [merchantId], references: [id])
  action     String    // contoh: USER_LOGIN, ORDER_CREATED, PRICE_UPDATED
  entity     String    // nama model yang diubah
  entityId   String?
  oldData    Json?
  newData    Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime  @default(now())

  @@index([userId, merchantId, action, entity, createdAt])
}

=== CATATAN PENTING ===

1. TIDAK ADA RESELLER
   Tidak ada Role RESELLER, tidak ada MLM,
   tidak ada downline, tidak ada komisi reseller.
   Merchant langsung jualan ke customer.

2. ROLE HANYA 3
   SUPER_ADMIN, MERCHANT, CUSTOMER

3. PAYMENT GATEWAY HANYA TRIPAY
   Semua transaksi, deposit, dan invoice subscription
   menggunakan Tripay. Field tripayReference wajib ada
   di Payment, Deposit, dan Invoice.

4. TIER HARGA 4 LEVEL
   NORMAL  → customer toko resmi + merchant FREE
   PRO     → merchant plan PRO
   LEGEND  → merchant plan LEGEND
   SUPREME → merchant plan SUPREME
   Mapping fleksibel via tabel PlanTierMapping.

5. isOfficial DI MERCHANT
   true  = toko resmi DagangPlay
   false = merchant berlangganan SaaS

6. SNAPSHOT DI ORDER
   productName, productSkuName, basePrice,
   sellingPrice, priceTierUsed disimpan sebagai
   snapshot saat transaksi. Harga bisa berubah
   tapi riwayat order tetap akurat.

7. SUPPLIER UTAMA = DIGIFLAZZ
   supplierCode = buyer_sku_code di Digiflazz
   Semua request/response dilog di SupplierLog.
   Setiap SKU bisa punya backup supplier (failover).

8. TIDAK ADA PriceHistory LAMA
   Diganti total dengan TierPriceHistory
   yang menyimpan semua 4 tier sekaligus.

Format output: Prisma Schema lengkap siap
dijalankan dengan perintah: prisma migrate dev