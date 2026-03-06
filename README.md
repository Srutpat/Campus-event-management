Campus Event Management System

A full stack web application for managing college events with role-based access.

Users:

Students

Organizers

Faculty

Features:

Role based login

Event creation

Event approval

Event registration

Attendance management

Modern dashboard UI

Tech Stack

Frontend

React

Tailwind CSS

Axios

React Router

Backend

Java

Spring Boot

Hibernate / JPA

REST APIs

Database

MySQL

Project Structure
campus-event-management
│
├── backend
│   └── eventmanagement
│       └── Spring Boot project
│
└── frontend
    └── React project
Prerequisites

Install the following software:

1️⃣ Java JDK 17
Download:
https://adoptium.net

2️⃣ Node.js (LTS)

Download:
https://nodejs.org

3️⃣ MySQL Server

Download:
https://dev.mysql.com/downloads/mysql/

4️⃣ Git

Download:
https://git-scm.com/downloads

Clone the Project

Run:

git clone https://github.com/<username>/campus-event-management.git

Enter folder:

cd campus-event-management
Database Setup (MySQL)

Open MySQL Workbench and run:

CREATE DATABASE campus_events;

Update backend configuration.

Open:

backend/eventmanagement/src/main/resources/application.properties

Update:

spring.datasource.url=jdbc:mysql://localhost:3306/campus_events
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
Run Backend (Spring Boot)

Open terminal:

cd backend/eventmanagement

Run:

mvn spring-boot:run

Backend will start on:

http://localhost:8081
Run Frontend (React)

Open new terminal.

cd frontend

Install dependencies:

npm install

Run React app:

npm run dev

Frontend will start on:

http://localhost:5173
Login Credentials

Use these test accounts.

Student

email: student@test.com
password: 1234

Organizer

email: organizer@test.com
password: 1234

Faculty

email: faculty@test.com
password: 1234
Application Flow

Student

View events

Register for events

Organizer

Create events

Manage participants

Faculty

Approve events

Download attendance

Future Improvements

Email notifications

Role based authorization with Spring Security

QR attendance system

Event analytics dashboard
