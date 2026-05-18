# Inventory Management Microservice System

A backend-focused Java microservice application built using Spring Boot, PostgreSQL, Redis, JWT Authentication, Docker, and Spring Cloud Gateway.

This project simulates a real-world scalable startup backend system with secure APIs, caching, centralized exception handling, transactional order processing, and CI/CD fundamentals.

---

# Project Architecture

![Architecture Diagram](./architecture.png)

---

# Microservices Architecture

The system follows a microservice-oriented architecture with independently deployable services.

![Microservices  Diagram](./auth.png)
![Microservices  Diagram](./inventory-service.png)
![Microservices  Diagram](./order-service.png)
![Microservices  Diagram](./api-gateway.png)

## Services

### 1. Auth Service
Handles:
- User registration
- Login authentication
- JWT token generation
- Role-based authorization

### 2. Inventory Service
Handles:
- Product management
- Inventory tracking
- Stock updates
- Product caching using Redis

### 3. Order Service
Handles:
- Order placement
- Inventory validation
- Stock deduction
- Transaction management

### 4. API Gateway
Handles:
- Centralized routing
- JWT validation
- Request filtering
- Secure API access

---

# Tech Stack

## Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Cloud Gateway
- Spring Data JPA
- Hibernate

## Database & Cache
- PostgreSQL
- Redis

## Authentication
- JWT Authentication
- BCrypt Password Encryption

## DevOps
- Docker
- Docker Compose
- GitHub Actions

## Documentation & Testing
- Swagger / OpenAPI
- JUnit
- Mockito

## Utilities
- Lombok
- SLF4J Logging

---

# Project Structure

```bash
inventory-management-system/
│
├── auth-service/
├── inventory-service/
├── order-service/
├── api-gateway/
│
├── docker-compose.yml
└── .github/workflows/main.yml