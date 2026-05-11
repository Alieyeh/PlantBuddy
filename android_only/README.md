# 🌿 PlantBuddy

![Android](https://img.shields.io/badge/platform-Android-green)
![Java](https://img.shields.io/badge/language-Java-orange)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue)
![Architecture](https://img.shields.io/badge/architecture-MVVM-lightgrey)
![License](https://img.shields.io/badge/license-Portfolio-blue)

PlantBuddy is a **full‑stack Android application** that connects plant
owners, plant sitters, and approved plant stores.

The application allows users to:

• Find trusted plant sitters\
• Swap plants with other plant enthusiasts\
• Donate plants to sitters\
• Purchase plants from approved stores

The project demonstrates **mobile development, backend API design, and
relational database engineering**.

This repository is intended as a **portfolio project showcasing
full‑stack application design**.

------------------------------------------------------------------------

# 📱 Application Overview

PlantBuddy is built using a **three‑tier architecture**:

``` mermaid
flowchart TD

A[Android App] --> B[REST API Backend]
B --> C[(PostgreSQL Database)]
```

The mobile app communicates with the backend using **RESTful APIs**,
while the backend manages authentication, business logic, and database
operations.

------------------------------------------------------------------------

# 🚀 Features

## Multi‑Role User System

Users can have multiple roles:

  -----------------------------------------------------------------------
  Role               Capabilities
  ------------------ ----------------------------------------------------
  Owner              Manage plants, request sitters, donate plants, swap
                     plants

  Sitter             Apply to care for plants, receive donations, manage
                     availability

  Store Owner        Sell plants through the platform (requires approval)
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Plant Listings

PlantBuddy supports four interaction types:

  Listing Type      Description
  ----------------- ----------------------------------------
  Sitting Request   Owner requests plant care for a period
  Donation          Owner donates a plant to a sitter
  Swap              Owners exchange plants
  Sale              Store owners sell plants

------------------------------------------------------------------------

## Plant Management

Each plant profile can contain:

-   species information
-   watering schedule
-   care instructions
-   photos
-   health notes
-   care tasks

------------------------------------------------------------------------

## Messaging System

Users can communicate through:

-   listing conversations
-   contract discussions
-   store orders

Messaging supports:

-   attachments
-   read receipts
-   delivery tracking

------------------------------------------------------------------------

## Contracts

Plant sitting arrangements become **formal contracts** including:

-   sitter and owner agreement
-   time range
-   negotiated payment
-   plant care expectations

------------------------------------------------------------------------

## Payments

A ledger‑style payment system tracks:

-   sitter payments
-   store purchases
-   refunds
-   payouts

------------------------------------------------------------------------

## Notifications

Users receive notifications for:

-   listing applications
-   swap proposals
-   contract updates
-   new messages
-   payment updates

------------------------------------------------------------------------

# 🏗 System Architecture

``` mermaid
flowchart LR

A[Android App] -->|Retrofit API Calls| B[Java REST API]

B --> C[Service Layer]

C --> D[Repository Layer]

D --> E[(PostgreSQL Database)]
```

------------------------------------------------------------------------

# 🧰 Technology Stack

### Mobile

-   Android Studio
-   Java
-   MVVM Architecture
-   Retrofit networking
-   ViewModel / LiveData

### Backend

-   Java Servlet API
-   Maven
-   JWT authentication
-   RESTful endpoints

### Database

-   PostgreSQL
-   normalized relational schema
-   trigger‑based business rules
-   indexed tables for performance

------------------------------------------------------------------------

# 🗂 Repository Structure

    plantbuddy/
    │
    ├── android-app/          Android mobile application
    │
    ├── backend/              REST API backend
    │   ├── config
    │   ├── repository
    │   ├── service
    │   ├── servlet
    │   └── security
    │
    ├── db/                   PostgreSQL schema
    │   ├── 001_init.sql
    │   ├── 002_seed_dev.sql
    │   └── ERD.mmd
    │
    └── docs/
        └── setup guides

------------------------------------------------------------------------

# 🗄 Database Design

The platform uses **role‑based profile tables**:

``` mermaid
erDiagram

USERS ||--o| OWNER_PROFILES : has
USERS ||--o| SITTER_PROFILES : has
USERS ||--o| STORE_OWNER_PROFILES : has

OWNER_PROFILES ||--o{ PLANTS : owns

PLANTS ||--o{ PLANT_LISTINGS : listed

PLANT_LISTINGS ||--o{ LISTING_APPLICATIONS : receives
PLANT_LISTINGS ||--o{ SWAP_PROPOSALS : receives

LISTING_APPLICATIONS }o--|| CONTRACTS : accepted_into

CONTRACTS ||--o{ CONTRACT_PLANTS : contains

PLANT_LISTINGS ||--o{ STORE_ORDERS : creates
```

Business rules are enforced using **PostgreSQL trigger functions**.

Examples:

• Only store owners can create sale listings\
• Swap proposals must use plants owned by the proposer\
• Applications require a sitter profile\
• Contracts originate only from sitting listings

------------------------------------------------------------------------

# 📡 API Overview

Example API endpoints:

### Authentication

    POST /api/auth/register
    POST /api/auth/login
    GET  /api/auth/me

### Plants

    GET    /api/plants
    POST   /api/plants
    PUT    /api/plants/{id}
    DELETE /api/plants/{id}

### Listings

    GET  /api/listings
    POST /api/listings

### Messaging

    GET  /api/conversations
    POST /api/messages

------------------------------------------------------------------------

# ⚙️ Local Development Setup

## 1 Install Dependencies

Required tools:

-   PostgreSQL
-   pgAdmin
-   Java JDK 17
-   Maven
-   Apache Tomcat 10+
-   Android Studio

------------------------------------------------------------------------

## 2 Setup Database

Create database:

    plantbuddy

Run schema:

    db/sql_build_tables.sql

Optional seed data:

    db/002_seed_dev.sql

------------------------------------------------------------------------

## 3 Configure Backend

Set environment variables:

    PLANTBUDDY_DB_URL=jdbc:postgresql://localhost:5432/plantbuddy
    PLANTBUDDY_DB_USER=plantbuddy_app
    PLANTBUDDY_DB_PASSWORD=password
    PLANTBUDDY_JWT_SECRET=longsecret
    PLANTBUDDY_ALLOWED_ORIGINS=http://localhost
    PLANTBUDDY_JWT_ACCESS_MINUTES=60

------------------------------------------------------------------------

## 4 Build Backend

    mvn clean package

Output:

    plantbuddy.war

------------------------------------------------------------------------

## 5 Deploy Backend

Copy WAR to:

    tomcat/webapps/

Run Tomcat.

Test:

    http://localhost:8080/plantbuddy/api/health

------------------------------------------------------------------------

## 6 Run Android App

Open:

    android-app/

Set API URL:

    http://10.0.2.2:8080/plantbuddy/

Run emulator.

------------------------------------------------------------------------

# 🔐 Security

Implemented security features:

• password hashing\
• JWT authentication\
• refresh tokens\
• role‑based access control\
• audit logging\
• moderation reporting

Planned improvements:

• rate limiting\
• HTTPS enforcement\
• secure file uploads\
• refresh token rotation

------------------------------------------------------------------------

# 📦 Future Improvements

-   advanced plant care scheduling
-   push notifications
-   sitter reputation scoring
-   image storage with cloud object storage
-   payment provider integration
-   Docker deployment
-   CI/CD pipelines
-   automated testing

------------------------------------------------------------------------

# 🤝 Contributing

Feedback and suggestions are welcome.

Possible contributions:

-   UI improvements
-   backend optimizations
-   test coverage
-   documentation


------------------------------------------------------------------------

# 👤 Author

Full‑stack project exploring:

-   Android mobile development
-   REST API architecture
-   relational database design
-   secure authentication systems
