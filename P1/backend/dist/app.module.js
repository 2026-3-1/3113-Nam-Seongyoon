"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("./modules/user/user.module");
const auth_module_1 = require("./modules/auth/auth.module");
const category_module_1 = require("./modules/category/category.module");
const course_module_1 = require("./modules/course/course.module");
const chapter_module_1 = require("./modules/chapter/chapter.module");
const enrollment_module_1 = require("./modules/enrollment/enrollment.module");
const review_module_1 = require("./modules/review/review.module");
const cart_module_1 = require("./modules/cart/cart.module");
const order_module_1 = require("./modules/order/order.module");
const instructor_module_1 = require("./modules/instructor/instructor.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'mysql',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 3306),
                    username: config.get('DB_USERNAME', 'root'),
                    password: config.get('DB_PASSWORD', ''),
                    database: config.get('DB_DATABASE', 'certificatedu'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: false,
                    logging: config.get('NODE_ENV') === 'development',
                    timezone: 'Z',
                }),
            }),
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            category_module_1.CategoryModule,
            course_module_1.CourseModule,
            chapter_module_1.ChapterModule,
            enrollment_module_1.EnrollmentModule,
            review_module_1.ReviewModule,
            cart_module_1.CartModule,
            order_module_1.OrderModule,
            instructor_module_1.InstructorModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map