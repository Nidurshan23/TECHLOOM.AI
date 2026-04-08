"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const port = Number(process.env.PORT ?? 4000);
    await app.listen(port);
    console.log(`KAIONEX backend running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map