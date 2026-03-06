# Campus Event Management System

A full-stack web application for managing college events with role-based access control.  
Students can register for events, organizers can manage them, and faculty can approve and track participation through a centralized dashboard.

## Features

- Role-based authentication
- Event creation and approval workflow
- Event registration for students
- Attendance management
- Dashboard for organizers and faculty

## Tech Stack

**Frontend**
- React
- Tailwind CSS
- Axios
- React Router

**Backend**
- Java
- Spring Boot
- Hibernate / JPA
- REST APIs

**Database**
- MySQL

## Project Structure

campus-event-management
│
├── backend
│   └── eventmanagement (Spring Boot)
│
└── frontend
    └── React Application


## Installation

### 1. Clone the repository
git clone https://github.com/username/campus-event-management.git
cd campus-event-management

### 2. Setup Database
CREATE DATABASE campus_events;

### 3. Run Backend
cd backend/eventmanagement
mvn spring-boot:run

### 4. Run Frontend
cd frontend
npm install
npm run dev


## Test Credentials

Student  
email: student@test.com  
password: 1234

Organizer  
email: organizer@test.com  
password: 1234

Faculty  
email: faculty@test.com  
password: 1234

## Application Flow

Student
- View events
- Register for events

Organizer
- Create events
- Manage participants

Faculty
- Approve events
- Download attendance


## Future Improvements

- Email notifications
- QR attendance system
- Role-based authorization using Spring Security
- Event analytics dashboard

## Author

Shraddha Utpat  
B.Tech Information Technology  
PCCOE, Pune
