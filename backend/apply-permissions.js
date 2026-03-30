const fs = require('fs');
const path = require('path');

const controllers = {
  'src/admin/dashboard/dashboard.controller.ts': 'manage_dashboard',
  'src/admin/finance/finance.controller.ts': 'manage_finance',
  'src/admin/merchants/merchants.controller.ts': 'manage_merchants',
  'src/admin/merchants/overrides.controller.ts': 'manage_merchants',
  'src/admin/products/products.controller.ts': 'manage_products',
  'src/admin/products/pricing-rules.controller.ts': 'manage_products',
  'src/admin/subscriptions/subscriptions.controller.ts': 'manage_subscriptions',
  'src/admin/settings/plan-mapping.controller.ts': 'manage_settings',
  'src/admin/settings/settings.controller.ts': 'manage_settings',
  'src/admin/transactions/transactions.controller.ts': 'manage_transactions',
  'src/admin/commissions/commissions.controller.ts': 'manage_transactions',
  'src/admin/users/users.controller.ts': 'manage_users',
  'src/admin/marketing/marketing.controller.ts': 'manage_marketing',
  'src/admin/content/content.controller.ts': 'manage_content',
  'src/admin/tickets/tickets.controller.ts': 'manage_tickets',
  'src/admin/digiflazz/digiflazz.controller.ts': 'manage_suppliers',
  'src/admin/suppliers/suppliers.controller.ts': 'manage_suppliers',
  'src/admin/security/security.controller.ts': 'manage_security',
  'src/admin/upload/upload.controller.ts': 'manage_content',
};

for (const [filePath, permission] of Object.entries(controllers)) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) continue;

  let code = fs.readFileSync(fullPath, 'utf8');

  // Skip if already applied
  if (code.includes('PermissionsGuard')) continue;

  // 1. Add import for Permissions and PermissionsGuard
  const guardImportLine = `\nimport { PermissionsGuard } from "../../auth/guards/permissions.guard";\nimport { Permissions } from "../../auth/decorators/permissions.decorator";`;
  
  code = code.replace(/import { RolesGuard } from (.*?);/, `import { RolesGuard } from $1;${guardImportLine}`);

  // 2. Update @UseGuards
  code = code.replace(/@UseGuards\(([^)]*?)RolesGuard([^)]*?)\)/, '@UseGuards($1RolesGuard, PermissionsGuard$2)');

  // 3. Add @Permissions above @Controller
  code = code.replace(/(@Controller\(.*?\))/, `@Permissions('${permission}')\n$1`);

  fs.writeFileSync(fullPath, code);
  console.log(`Updated ${filePath}`);
}

// Special case: SaaS controller which is in a different path
const saasPath = path.join(__dirname, 'src/saas/saas.controller.ts');
if (fs.existsSync(saasPath)) {
  let saasCode = fs.readFileSync(saasPath, 'utf8');
  if (!saasCode.includes('PermissionsGuard')) {
    const saasImportLine = `\nimport { PermissionsGuard } from "src/auth/guards/permissions.guard";\nimport { Permissions } from "src/auth/decorators/permissions.decorator";`;
    saasCode = saasCode.replace(/import { RolesGuard } from (.*?);/, `import { RolesGuard } from $1;${saasImportLine}`);
    saasCode = saasCode.replace(/@UseGuards\(([^)]*?)RolesGuard([^)]*?)\)/, '@UseGuards($1RolesGuard, PermissionsGuard$2)');
    saasCode = saasCode.replace(/(@Controller\(.*?\))/, `@Permissions('manage_saas')\n$1`);
    fs.writeFileSync(saasPath, saasCode);
    console.log(`Updated src/saas/saas.controller.ts`);
  }
}
