import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { LoggerMiddleware } from '@core/http/middlewares/logger.middleware';

import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';

import {
  AcademicBackgroundsModule,
  AcademicCyclesModule,
  AcademicLoadGroupsModule,
  AcademicLoadsModule,
  CampusesModule,
  CareersModule,
  ClassroomsModule,
  CommMembersModule,
  CommSessionAttendancesModule,
  CommSessionsModule,
  CommissionsModule,
  CoursesModule,
  DocumentsModule,
  FacultiesModule,
  FinalReportsModule,
  FinalWorksModule,
  IntellectualProductionsModule,
  ObservationsModule,
  ParametersModule,
  PpaasModule,
  ProjectLogsModule,
  ProjectReviewsModule,
  ProjectsModule,
  QuestionGroupsModule,
  QuestionsModule,
  RegionalCentersModule,
  SchedulesModule,
  SchoolsModule,
  UserLanguagesModule,
  UserPermissionsModule,
  UserRolesModule,
  UserWorkExperiencesModule,
  UsersModule,
} from '@modules/index';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AcademicBackgroundsModule,
    AcademicCyclesModule,
    AcademicLoadGroupsModule,
    AcademicLoadsModule,
    CampusesModule,
    CareersModule,
    ClassroomsModule,
    CommMembersModule,
    CommSessionAttendancesModule,
    CommSessionsModule,
    CommissionsModule,
    CoursesModule,
    DocumentsModule,
    FacultiesModule,
    FinalReportsModule,
    FinalWorksModule,
    IntellectualProductionsModule,
    ObservationsModule,
    ParametersModule,
    PpaasModule,
    ProjectLogsModule,
    ProjectReviewsModule,
    ProjectsModule,
    QuestionGroupsModule,
    QuestionsModule,
    RegionalCentersModule,
    SchedulesModule,
    SchoolsModule,
    UserLanguagesModule,
    UserPermissionsModule,
    UserRolesModule,
    UserWorkExperiencesModule,
    UsersModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
