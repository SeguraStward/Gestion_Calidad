# Relaciones de Modelos en Prisma

## AcademicLoad
El modelo `AcademicLoad` representa una carga académica y tiene las siguientes relaciones:
- **Classroom**: Relación uno a uno con `Classroom` a través de `classroomId`.
- **Campus**: Relación uno a uno con `Campus` a través de `campusId`.
- **Term**: Relación uno a uno con `Term` a través de `termId`.
- **Course**: Relación uno a uno con `Course` a través de `courseId`.
- **Group**: Relación uno a uno con `Group` a través de `groupId`.
- **Schedule**: Relación uno a uno con `Schedule` a través de `scheduleId`.
- **Professor**: Relación uno a uno con `Professor` a través de `professorId`.
- **StudentEnrollment**: Relación muchos a muchos con `StudentEnrollment`.
- **FinalReport**: Relación uno a muchos con `FinalReport`.

## Campus
El modelo `Campus` representa un campus y tiene las siguientes relaciones:
- **Classroom**: Relación uno a muchos con `Classroom`.
- **AcademicLoad**: Relación uno a muchos con `AcademicLoad`.

## Classroom
El modelo `Classroom` representa un aula y tiene las siguientes relaciones:
- **Campus**: Relación uno a uno con `Campus` a través de `campusId`.
- **AcademicLoad**: Relación uno a muchos con `AcademicLoad`.

## Course
El modelo `Course` representa un curso y tiene las siguientes relaciones:
- **School**: Relación uno a uno con `School` a través de `schoolId`.
- **AcademicLoad**: Relación uno a muchos con `AcademicLoad`.

## Faculty
El modelo `Faculty` representa una facultad y tiene las siguientes relaciones:
- **School**: Relación uno a muchos con `School`.

## FinalReport
El modelo `FinalReport` representa un reporte final y tiene las siguientes relaciones:
- **AcademicLoad**: Relación uno a uno con `AcademicLoad` a través de `loadId`.
- **Professor**: Relación uno a uno con `Professor` a través de `professorId`.

## Group
El modelo `Group` representa un grupo y tiene las siguientes relaciones:
- **AcademicLoad**: Relación uno a muchos con `AcademicLoad`.

## IntellectualProduction
El modelo `IntellectualProduction` representa una producción intelectual y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `userId`.

## Language
El modelo `Language` representa un idioma y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `userId`.

## Ppaa
El modelo `Ppaa` representa una actividad de PPAA y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `userId`.

## Professor
El modelo `Professor` representa un profesor y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `userId`.
- **School**: Relación uno a uno con `School` a través de `schoolId`.
- **AcademicLoad**: Relación uno a muchos con `AcademicLoad`.

## School
El modelo `School` representa una escuela y tiene las siguientes relaciones:
- **Faculty**: Relación uno a uno con `Faculty` a través de `idFaculty`.
- **Course**: Relación uno a muchos con `Course`.
- **Professor**: Relación uno a muchos con `Professor`.

## StudentEnrollment
El modelo `StudentEnrollment` representa una matrícula de estudiante y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `studentId`.
- **AcademicLoad**: Relación uno a uno con `AcademicLoad` a través de `academicLoadId`.

## Term
El modelo `Term` representa un término académico y tiene las siguientes relaciones:
- **AcademicLoad**: Relación uno a muchos con `AcademicLoad`.

## User
El modelo `User` representa un usuario y tiene las siguientes relaciones:
- **Professor**: Relación uno a uno con `Professor`.
- **GeneralConfiguration**: Relación uno a uno con `GeneralConfiguration`.
- **WorkExperience**: Relación uno a muchos con `WorkExperience`.
- **StudentEnrollment**: Relación uno a muchos con `StudentEnrollment`.
- **FinalWork**: Relación uno a muchos con `FinalWork`.
- **Language**: Relación uno a muchos con `Language`.
- **Ppaa**: Relación uno a muchos con `Ppaa`.
- **IntellectualProduction**: Relación uno a muchos con `IntellectualProduction`.

## WorkExperience
El modelo `WorkExperience` representa una experiencia laboral y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `userId`.

## FinalWork
El modelo `FinalWork` representa un trabajo final y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `userId`.

## GeneralConfiguration
El modelo `GeneralConfiguration` representa la configuración general y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `userId`.

## Question
El modelo `Question` representa una pregunta y tiene las siguientes relaciones:
- **QuestionGroup**: Relación uno a uno con `QuestionGroup` a través de `groupId`.

## QuestionGroup
El modelo `QuestionGroup` representa un grupo de preguntas y no tiene relaciones adicionales.

## IfQuestion
El modelo `IfQuestion` representa una pregunta condicional y no tiene relaciones adicionales.

## AcademicBackground
El modelo `AcademicBackground` representa un historial académico y tiene las siguientes relaciones:
- **User**: Relación uno a uno con `User` a través de `userId`.

## Schema
El archivo `schema.prisma` define el generador y la fuente de datos para Prisma.

```prisma
generator client {
    provider        = "prisma-client-js"
    output          = "./../generated/client"
    previewFeatures = ["multiSchema", "prismaSchemaFolder"]
}

datasource db {
    provider = "mongodb"
    url      = env("DATABASE_URL")
}