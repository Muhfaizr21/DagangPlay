"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.use((req, res, next) => {
        console.log(`[REQ] ${req.method} ${req.url}`);
        if (!req.headers.authorization) {
            console.log(`      No Authorization header found!`);
        }
        else {
            console.log(`      Auth Header present: ${req.headers.authorization.substring(0, 20)}...`);
        }
        next();
    });
    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
//# sourceMappingURL=main.js.map