import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { LoggerMiddleware } from '@core/http/middlewares/logger.middleware';

import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from '@modules/users/users.module';
import { CampusesModule } from '@modules/campuses/campuses.module';
import { AcademicBackgroundsModule } from '@modules/academic-backgrounds/academic-backgrounds.module';
import { AcademicLoadsModule } from '@modules/academic-loads/academic-loads.module';
import { AcademicPeriodsModule } from '@modules/academic-periods/academic-periods.module';
import { ClassroomsModule } from '@modules/classrooms/classrooms.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { FacultiesModule } from '@modules/faculties/faculties.module';
import { FinalReportsModule } from '@modules/final-reports/final-reports.module';
import { FinalWorksModule } from '@modules/final-works/final-works.module';
import { IntellectualProductionsModule } from '@modules/intellectual-productions/intellectual-productions.module';
import { PpaasModule } from '@modules/ppaas/ppaas.module';
import { ProfessorsModule } from '@modules/professors/professors.module';
import { SchedulesModule } from '@modules/schedules/schedules.module';
import { SchoolsModule } from '@modules/schools/schools.module';
import { UserLanguagesModule } from '@modules/user-languages/user-languages.module';
import { WorkExperiencesModule } from '@modules/work-experiences/work-experiences.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    CampusesModule,
    AcademicBackgroundsModule,
    AcademicLoadsModule,
    AcademicPeriodsModule,
    ClassroomsModule,
    CoursesModule,
    FacultiesModule,
    FinalReportsModule,
    FinalWorksModule,
    IntellectualProductionsModule,
    PpaasModule,
    ProfessorsModule,
    SchedulesModule,
    SchoolsModule,
    UserLanguagesModule,
    WorkExperiencesModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
