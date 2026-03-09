Buatkan Prisma Schema lengkap untuk platform SaaS voucher 
& top up games bernama "DagangPlay" menggunakan PostgreSQL.

Platform ini adalah:
1. Toko resmi DagangPlay (jualan langsung ke customer & reseller)
2. Platform SaaS (merchant bisa buka toko sendiri berlangganan)

Stack: NestJS + Prisma + PostgreSQL + Redis + Tripay + Digiflazz

=== ARSITEKTUR BISNIS ===

- Multi-tenant: satu database untuk semua merchant
- Role: SUPER_ADMIN, MERCHANT, RESELLER, CUSTOMER
- Supplier voucher: Digiflazz (utama) + backup supplier lain
- Payment gateway: Tripay (untuk deposit & subscription)
- Tier harga produk: 4 level
  NORMAL  = harga customer beli di toko resmi DagangPlay
  PRO     = harga modal merchant plan PRO
  LEGEND  = harga modal merchant plan LEGEND
  SUPREME = harga modal merchant plan SUPREME
- MLM komisi downline 3 level

=== ENUM DEFINITIONS ===

enum Role {
  SUPER_ADMIN
  MERCHANT
  RESELLER
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

// 3 plan berbayar + FREE
// Mapping ke tier harga:
// FREE     → harga NORMAL (sama seperti customer)
// PRO      → harga PRO
// LEGEND   → harga LEGEND
// SUPREME  → harga SUPREME
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

// Tier harga produk
// NORMAL  = harga customer toko resmi DagangPlay
// PRO/LEGEND/SUPREME = harga modal merchant sesuai plan
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

// Semua metode payment via Tripay
enum PaymentMethod {
  BALANCE           // bayar pakai saldo DagangPlay
  TRIPAY_QRIS       // QRIS via Tripay
  TRIPAY_VA_BCA     // Virtual Account BCA
  TRIPAY_VA_BNI     // Virtual Account BNI
  TRIPAY_VA_BRI     // Virtual Account BRI
  TRIPAY_VA_MANDIRI // Virtual Account Mandiri
  TRIPAY_VA_PERMATA // Virtual Account Permata
  TRIPAY_GOPAY      // GoPay via Tripay
  TRIPAY_OVO        // OVO via Tripay
  TRIPAY_DANA       // DANA via Tripay
  TRIPAY_SHOPEEPAY  // ShopeePay via Tripay
  TRIPAY_ALFAMART   // Alfamart via Tripay
  TRIPAY_INDOMARET  // Indomaret via Tripay
  MANUAL_TRANSFER   // Transfer manual (konfirmasi admin)
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
  COMMISSION
  BONUS
  ADJUSTMENT
  MLM_COMMISSION
}

enum WithdrawalStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
}

enum CommissionType {
  FLAT
  PERCENTAGE
}

enum CommissionAppliesTo {
  ALL
  CATEGORY
  PRODUCT
}

enum CommissionForRole {
  RESELLER
  MERCHANT
}

enum CommissionStatus {
  PENDING
  SETTLED
  CANCELLED
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

enum PromoForRole {
  ALL
  CUSTOMER
  RESELLER
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

enum ResellerLevelName {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
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

// Master semua user semua role
model User {
  id              String     @id @default(cuid())
  email           String?    @unique
  phone           String?    @unique
  password        String
  name            String
  username        String?    @unique
  avatar          String?
  role            Role       @default(CUSTOMER)
  status          UserStatus @default(ACTIVE)
  isVerified      Boolean    @default(false)
  verifiedAt      DateTime?
  referralCode    String     @unique
  referredById    String?
  referredBy      User?      @relation("UserReferral", fields: [referredById], references: [id])
  referrals       User[]     @relation("UserReferral")
  merchantId      String?
  balance         Float      @default(0)
  bonusBalance    Float      @default(0)
  resellerLevelId String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  deletedAt       DateTime?

  // Relations
  profile               UserProfile?
  sessions              UserSession[]
  otpVerifications      OtpVerification[]
  merchantMemberships   MerchantMember[]
  ownedMerchant         Merchant?              @relation("MerchantOwner")
  ordersAsCustomer      Order[]                @relation("OrderCustomer")
  ordersAsReseller      Order[]                @relation("OrderReseller")
  balanceTransactions   BalanceTransaction[]
  deposits              Deposit[]
  withdrawals           Withdrawal[]
  commissionsEarned     Commission[]
  referralRewards       ReferralReward[]       @relation("ReferrerRewards")
  referralRewardsFrom   ReferralReward[]       @relation("ReferredRewards")
  promoUsages           PromoUsage[]
  notifications         Notification[]
  supportTickets        SupportTicket[]        @relation("TicketUser")
  assignedTickets       SupportTicket[]        @relation("TicketAssigned")
  ticketReplies         SupportTicketReply[]
  productReviews        ProductReview[]
  auditLogs             AuditLog[]
  apiKeys               ApiKey[]
  trustedDevices        DeviceTrusted[]
  loginAttempts         LoginAttempt[]
  fraudDetections       FraudDetection[]
  resellerLevel         ResellerLevel?         @relation(fields: [resellerLevelId], references: [id])
  resellerLevelHistory  ResellerLevelHistory[]
  downlineAsParent      DownlineTree?          @relation("DownlineParent")
  downlineAsChild       DownlineTree[]         @relation("DownlineChild")
  mlmCommissions        MLMCommission[]
  userFavorites         UserFavorite[]
  userActivityLogs      UserActivityLog[]
  merchantProductPrices MerchantProductPrice[]
  resellerProductPrices ResellerProductPrice[]
  emailCampaignLogs     EmailCampaignLog[]
  pushNotifLogs         PushNotificationLog[]
  confirmedDeposits     Deposit[]              @relation("DepositConfirmedBy")
  processedWithdrawals  Withdrawal[]           @relation("WithdrawalProcessedBy")
  priceHistories        TierPriceHistory[]

  @@index([email, phone, role, status, merchantId, referredById])
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

model IPBlacklist {
  id        String    @id @default(cuid())
  ipAddress String    @unique
  reason    String
  blockedBy String
  expiresAt DateTime?
  createdAt DateTime  @default(now())

  @@index([ipAddress])
}

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

// ============================================
// MERCHANT / TENANT
// ============================================

// Data tenant/mitra berlangganan SaaS
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
  isOfficial      Boolean        @default(false) // true = toko resmi DagangPlay
  settings        Json?
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

// Anggota tim merchant
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

// Data supplier voucher (Digiflazz dll)
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
  duration     Int?
  isSuccess    Boolean
  createdAt    DateTime  @default(now())

  @@index([supplierId, orderId, isSuccess, createdAt])
}

// Riwayat saldo di supplier
model SupplierBalanceHistory {
  id            String   @id @default(cuid())
  supplierId    String
  supplier      Supplier @relation(fields: [supplierId], references: [id])
  type          String
  amount        Float
  balanceBefore Float
  balanceAfter  Float
  note          String?
  createdAt     DateTime @default(now())

  @@index([supplierId, createdAt])
}

// Kategori produk (nested)
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
  commissionRules   CommissionRule[]
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

  // Info game untuk validasi ID
  gameIdLabel    String?  // label field ID (contoh: "User ID", "Player ID")
  gameServerId   Boolean  @default(false) // perlu input server atau tidak
  serverLabel    String?  // label field server (contoh: "Server", "Zone")

  // Info dari Digiflazz
  digiflazzBrand    String?  // brand di Digiflazz (contoh: "Mobile Legends")
  digiflazzCategory String?  // kategori di Digiflazz

  instruction String?       // cara top up step by step
  status      ProductStatus @default(ACTIVE)
  sortOrder   Int           @default(0)
  isFeatured  Boolean       @default(false)
  isPopular   Boolean       @default(false)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  skus              ProductSku[]
  reviews           ProductReview[]
  commissionRules   CommissionRule[]
  gameServers       GameServer[]
  userFavorites     UserFavorite[]
  productSalesStats ProductSalesStats[]
  maintenances      MaintenanceSchedule[]
  refundPolicy      RefundPolicy?
}

// SKU/varian produk dengan sistem 4 tier harga
// Ini inti dari koneksi ke Digiflazz
model ProductSku {
  id           String    @id @default(cuid())
  productId    String
  product      Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  supplierId   String
  supplier     Supplier  @relation(fields: [supplierId], references: [id])
  name         String    // contoh: "86 Diamond"

  // Kode produk di Digiflazz (buyer_sku_code)
  supplierCode String    // contoh: "mleg-86"

  // Supplier backup jika utama gagal
  backupSupplierId   String?
  backupSupplierCode String?

  // Harga beli dari Digiflazz (tidak tampil ke merchant/reseller/customer)
  basePrice    Float

  // Harga jual per tier
  // NORMAL  = harga customer beli di toko resmi DagangPlay
  // PRO     = harga modal merchant plan PRO
  // LEGEND  = harga modal merchant plan LEGEND
  // SUPREME = harga modal merchant plan SUPREME
  priceNormal  Float
  pricePro     Float
  priceLegend  Float
  priceSupreme Float

  // Margin tersimpan untuk referensi cepat (dalam persen)
  marginNormal  Float
  marginPro     Float
  marginLegend  Float
  marginSupreme Float

  stock     Int       @default(-1) // -1 = unlimited
  status    SkuStatus @default(ACTIVE)
  sortOrder Int       @default(0)
  metadata  Json?     // data tambahan dari Digiflazz
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  orders                Order[]
  merchantProductPrices MerchantProductPrice[]
  resellerProductPrices ResellerProductPrice[]
  promoCodes            PromoCode[]
  tierPriceHistories    TierPriceHistory[]

  @@index([productId, supplierId, status, supplierCode])
}

// Formula otomatis set harga per tier per kategori
// Supaya Super Admin tidak set manual satu-satu SKU
model TierPricingRule {
  id         String    @id @default(cuid())
  categoryId String?   // null = berlaku global semua kategori
  category   Category? @relation(fields: [categoryId], references: [id])

  // Persentase margin per tier di atas basePrice
  marginNormal  Float // contoh: 11.4 = 11.4% di atas harga beli
  marginPro     Float // contoh: 8.0
  marginLegend  Float // contoh: 5.7
  marginSupreme Float // contoh: 3.4

  // Batas minimum margin (sistem tolak jika di bawah ini)
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

// Riwayat perubahan harga per tier (gabungan dari PriceHistory lama)
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

  // Trigger perubahan
  changeType ChangeType
  changedBy  String     // userId atau "SYSTEM"
  reason     String?
  createdAt  DateTime   @default(now())

  @@index([productSkuId, changeType, createdAt])
}

// Mapping plan merchant ke tier harga
// Fleksibel: bisa diubah Super Admin tanpa deploy ulang
// Contoh: promo bulan ini STARTER dapat harga PRO
model PlanTierMapping {
  id        String       @id @default(cuid())
  plan      MerchantPlan @unique
  tier      PriceTier
  isActive  Boolean      @default(true)
  updatedBy String
  updatedAt DateTime     @updatedAt
}

// Data default PlanTierMapping:
// FREE    → NORMAL
// PRO     → PRO
// LEGEND  → LEGEND
// SUPREME → SUPREME

// Harga override khusus per merchant
// Digunakan jika Super Admin beri harga spesial
// diluar tier normal ke merchant tertentu
model MerchantProductPrice {
  id           String     @id @default(cuid())
  merchantId   String
  merchant     Merchant   @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  productSkuId String
  productSku   ProductSku @relation(fields: [productSkuId], references: [id])
  userId       String     // Super Admin yang set
  user         User       @relation(fields: [userId], references: [id])
  customPrice  Float      // harga khusus untuk merchant ini
  isActive     Boolean    @default(true)
  reason       String?    // alasan diberi harga khusus
  expiredAt    DateTime?  // batas waktu harga khusus berlaku
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([merchantId, productSkuId])
  @@index([merchantId, productSkuId, isActive])
}

// Harga override khusus per reseller
// Digunakan jika merchant beri harga spesial ke reseller tertentu
model ResellerProductPrice {
  id           String     @id @default(cuid())
  userId       String     // resellerId
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  productSkuId String
  productSku   ProductSku @relation(fields: [productSkuId], references: [id])
  customPrice  Float
  isActive     Boolean    @default(true)
  reason       String?
  expiredAt    DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([userId, productSkuId])
  @@index([userId, productSkuId, isActive])
}

// Server/region per game (ML server 1-999 dll)
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

// Log validasi ID game
model GameValidation {
  id         String   @id @default(cuid())
  productId  String
  gameUserId String
  serverId   String?
  nickname   String?
  isValid    Boolean
  checkedAt  DateTime @default(now())
  ipAddress  String?

  @@index([productId, gameUserId])
}

// Cache nickname akun game
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
  id                   String                 @id @default(cuid())
  orderNumber          String                 @unique // DP-20250101-XXXX
  userId               String
  user                 User                   @relation("OrderCustomer", fields: [userId], references: [id])
  merchantId           String
  merchant             Merchant               @relation(fields: [merchantId], references: [id])
  resellerId           String?
  reseller             User?                  @relation("OrderReseller", fields: [resellerId], references: [id])
  productId            String
  productSkuId         String
  productSku           ProductSku             @relation(fields: [productSkuId], references: [id])

  // Snapshot data saat transaksi (penting! harga bisa berubah)
  productName          String
  productSkuName       String
  priceTierUsed        PriceTier              // tier harga yang dipakai saat transaksi
  basePrice            Float                  // harga beli dari supplier saat itu
  sellingPrice         Float                  // harga jual ke customer saat itu
  totalPrice           Float

  // Data game customer
  gameUserId           String
  gameUserServerId     String?
  gameUserName         String?

  quantity             Int                    @default(1)

  // Promo
  promoCodeId          String?
  promoCode            PromoCode?             @relation(fields: [promoCodeId], references: [id])
  discountAmount       Float                  @default(0)

  // Payment
  paymentMethod        PaymentMethod?
  paymentStatus        OrderPaymentStatus     @default(PENDING)

  // Fulfillment ke supplier
  fulfillmentStatus    OrderFulfillmentStatus @default(PENDING)
  supplierId           String?
  supplierRefId        String?                // ref_id di Digiflazz
  supplierResponse     Json?                  // response lengkap Digiflazz
  serialNumber         String?                // SN dari Digiflazz jika ada

  note                 String?
  failReason           String?
  paidAt               DateTime?
  processedAt          DateTime?
  completedAt          DateTime?
  failedAt             DateTime?
  expiredAt            DateTime?
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt

  payment              Payment?
  statusHistories      OrderStatusHistory[]
  commissions          Commission[]
  fraudDetections      FraudDetection[]
  supplierLogs         SupplierLog[]
  balanceTrx           BalanceTransaction[]
  disputeCases         DisputeCase[]
  mlmCommissions       MLMCommission[]

  @@index([userId, merchantId, resellerId, paymentStatus, fulfillmentStatus, createdAt])
}

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
  id        String        @id @default(cuid())
  orderId   String        @unique
  order     Order         @relation(fields: [orderId], references: [id])
  userId    String
  merchantId String

  method    PaymentMethod
  amount    Float
  fee       Float         @default(0) // biaya payment gateway Tripay
  totalAmount Float       // amount + fee

  status    PaymentStatus @default(PENDING)

  // Data dari Tripay
  tripayReference    String?  // nomor referensi Tripay
  tripayMerchantRef  String?  // merchant_ref yang kita kirim ke Tripay
  tripayPaymentUrl   String?  // URL pembayaran untuk redirect
  tripayQrUrl        String?  // URL QR code jika QRIS
  tripayVaNumber     String?  // nomor Virtual Account
  tripayExpiredTime  DateTime? // batas waktu bayar dari Tripay
  tripayResponse     Json?    // full response dari Tripay

  paidAt    DateTime?
  expiredAt DateTime?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([orderId, userId, merchantId, status, tripayReference])
}

// Konfigurasi channel pembayaran per merchant
// Merchant bisa aktif/nonaktif channel tertentu
model PaymentChannel {
  id         String        @id @default(cuid())
  merchantId String?       // null = setting global
  merchant   Merchant?     @relation(fields: [merchantId], references: [id])
  method     PaymentMethod
  name       String        // nama tampil ke customer
  icon       String?
  fee        Float         @default(0)
  feeType    FeeType       @default(FLAT)
  minAmount  Float?
  maxAmount  Float?
  isActive   Boolean       @default(true)
  sortOrder  Int           @default(0)

  // Konfigurasi Tripay per merchant (jika multi merchant key)
  tripayConfig Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([merchantId, method, isActive])
}

// ============================================
// SALDO & DEPOSIT
// ============================================

model Deposit {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  merchantId    String
  merchant      Merchant      @relation(fields: [merchantId], references: [id])
  amount        Float
  method        PaymentMethod
  status        DepositStatus @default(PENDING)

  // Data Tripay untuk deposit
  tripayReference   String?
  tripayMerchantRef String?
  tripayPaymentUrl  String?
  tripayVaNumber    String?
  tripayQrUrl       String?
  tripayResponse    Json?

  // Jika deposit manual transfer
  receiptImage  String?
  confirmedById String?
  confirmedBy   User?         @relation("DepositConfirmedBy", fields: [confirmedById], references: [id])
  confirmedAt   DateTime?
  rejectedAt    DateTime?
  note          String?
  expiredAt     DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  balanceTransaction BalanceTransaction?

  @@index([userId, merchantId, status, createdAt])
}

// Mutasi saldo
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

// Penarikan saldo
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
// KOMISI & REFERRAL
// ============================================

model CommissionRule {
  id          String              @id @default(cuid())
  merchantId  String?
  name        String
  description String?
  type        CommissionType
  value       Float
  appliesTo   CommissionAppliesTo @default(ALL)
  categoryId  String?
  category    Category?           @relation(fields: [categoryId], references: [id])
  productId   String?
  product     Product?            @relation(fields: [productId], references: [id])
  forRole     CommissionForRole
  isActive    Boolean             @default(true)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@index([merchantId, forRole, isActive])
}

model Commission {
  id        String           @id @default(cuid())
  orderId   String
  order     Order            @relation(fields: [orderId], references: [id])
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  type      String
  amount    Float
  status    CommissionStatus @default(PENDING)
  settledAt DateTime?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@index([orderId, userId, status])
}

model ReferralReward {
  id         String           @id @default(cuid())
  referrerId String
  referrer   User             @relation("ReferrerRewards", fields: [referrerId], references: [id])
  referredId String
  referred   User             @relation("ReferredRewards", fields: [referredId], references: [id])
  orderId    String?
  amount     Float
  type       String
  status     CommissionStatus @default(PENDING)
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  @@index([referrerId, referredId, status])
}

// ============================================
// MULTI-LEVEL RESELLER (MLM)
// ============================================

model ResellerLevel {
  id              String            @id @default(cuid())
  name            ResellerLevelName
  minTransaction  Int               @default(0)
  minRevenue      Float             @default(0)
  commissionBonus Float             @default(0)
  badge           String?
  benefits        Json?
  isActive        Boolean           @default(true)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  users          User[]
  levelHistories ResellerLevelHistory[]
}

model ResellerLevelHistory {
  id        String        @id @default(cuid())
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  levelId   String
  level     ResellerLevel @relation(fields: [levelId], references: [id])
  oldLevel  String?
  newLevel  String
  reason    String?
  createdAt DateTime      @default(now())

  @@index([userId, createdAt])
}

model DownlineTree {
  id        String   @id @default(cuid())
  parentId  String
  parent    User     @relation("DownlineParent", fields: [parentId], references: [id])
  childId   String
  child     User     @relation("DownlineChild", fields: [childId], references: [id])
  level     Int      @default(1) // 1, 2, atau 3
  createdAt DateTime @default(now())

  @@unique([parentId, childId])
  @@index([parentId, childId, level])
}

model MLMCommission {
  id        String           @id @default(cuid())
  orderId   String
  order     Order            @relation(fields: [orderId], references: [id])
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  level     Int              // 1, 2, atau 3
  percentage Float
  amount    Float
  status    CommissionStatus @default(PENDING)
  settledAt DateTime?
  createdAt DateTime         @default(now())

  @@index([orderId, userId, level, status])
}

// ============================================
// PROMO & VOUCHER DISKON
// ============================================

model PromoCode {
  id           String         @id @default(cuid())
  merchantId   String?
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
  productSkuId String?
  productSku   ProductSku?    @relation(fields: [productSkuId], references: [id])
  forRole      PromoForRole   @default(ALL)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  usages PromoUsage[]
  orders Order[]

  @@index([code, merchantId, isActive])
}

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

// Invoice subscription SaaS merchant (dibayar via Tripay)
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

  // Tripay untuk bayar invoice subscription
  tripayReference  String?
  tripayPaymentUrl String?
  tripayResponse   Json?

  paidAt    DateTime?
  notes     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([merchantId, status, dueDate])
}

model SubscriptionHistory {
  id         String       @id @default(cuid())
  merchantId String
  merchant   Merchant     @relation(fields: [merchantId], references: [id])
  oldPlan    MerchantPlan?
  newPlan    MerchantPlan
  startDate  DateTime
  endDate    DateTime
  amount     Float
  note       String?
  createdAt  DateTime     @default(now())

  @@index([merchantId, createdAt])
}

// ============================================
// ANALYTICS & REPORTING
// ============================================

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
  merchantId String?
  type       NotificationType
  channel    NotificationChannel
  subject    String?
  body       String
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
  merchantId String?
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
  isVerified  Boolean  @default(false)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([productId, userId, rating, isPublished])
}

// ============================================
// OPERASIONAL
// ============================================

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

model JobQueue {
  id          String    @id @default(cuid())
  type        String
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
// FRAUD & KEAMANAN LANJUT
// ============================================

model ApiRateLimit {
  id        String   @id @default(cuid())
  userId    String?
  ipAddress String
  endpoint  String
  hitCount  Int      @default(1)
  windowStart DateTime
  windowEnd   DateTime
  isBlocked Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, ipAddress, endpoint, windowStart])
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
  action     String
  entity     String
  entityId   String?
  oldData    Json?
  newData    Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime  @default(now())

  @@index([userId, merchantId, action, entity, createdAt])
}

=== CATATAN PENTING ===

1. Payment gateway HANYA Tripay
   - Semua transaksi order pakai Tripay
   - Semua deposit saldo pakai Tripay
   - Semua pembayaran invoice subscription pakai Tripay
   - Field tripayReference wajib ada di Payment, Deposit, Invoice

2. Tier harga 4 level:
   - NORMAL  = customer beli di toko resmi DagangPlay
   - PRO     = harga modal merchant plan PRO
   - LEGEND  = harga modal merchant plan LEGEND
   - SUPREME = harga modal merchant plan SUPREME
   - Mapping plan ke tier ada di tabel PlanTierMapping
   - Bisa diubah Super Admin tanpa deploy ulang

3. isOfficial di Merchant:
   - true  = toko resmi DagangPlay sendiri
   - false = merchant/mitra yang berlangganan

4. Supplier utama = Digiflazz
   - Field supplierCode = buyer_sku_code di Digiflazz
   - Setiap SKU bisa punya backup supplier
   - Semua request/response Digiflazz dilog di SupplierLog

5. sellingPrice di Order adalah SNAPSHOT
   - Harga bisa berubah kapan saja
   - Order menyimpan harga saat transaksi terjadi
   - Pakai field priceTierUsed untuk tau tier apa yang dipakai

6. PlanTierMapping default:
   - FREE    → NORMAL
   - PRO     → PRO
   - LEGEND  → LEGEND
   - SUPREME → SUPREME

Format output: Prisma Schema lengkap siap 
dijalankan dengan perintah: prisma migrate dev