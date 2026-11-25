# LocalKart

### Empowering Local Businesses, Connecting Communities.

LocalKart is a full-stack multi-vendor marketplace that connects customers with local sellers. It allows customers to discover products, place orders, and submit reviews while sellers can manage their products and customer orders.

## Features

### Customer Features
- Customer registration and login
- Browse available products
- View product details
- Add products to shopping cart
- Place orders
- Track order status
- Submit product reviews and ratings

### Seller Features
- Seller registration and login
- Seller dashboard
- Add new products
- Update and manage products
- View customer orders
- Update order status
- View customer reviews

### Security Features
- JWT-based authentication
- Password encryption using BCrypt
- Role-based authorization
- Seller-specific product ownership validation

## Technologies Used

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST APIs
- Maven
- JWT Authentication

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Database
- MySQL

### Development Tools
- Visual Studio Code
- Postman / Thunder Client
- Git
- GitHub
- Node.js and npm

## Project Architecture

LocalKart follows a layered architecture:

1. **Frontend:** React application providing the user interface for customers and sellers.
2. **Backend:** Spring Boot REST APIs handling authentication, business logic, product management, orders, and reviews.
3. **Database:** MySQL storing users, sellers, products, carts, orders, and reviews.

### Application Flow

React Frontend → Spring Boot REST API → Service Layer → Repository Layer → MySQL Database

## Installation and Setup

### Prerequisites

Before running LocalKart, install:

- Java 21 or later
- Node.js and npm
- MySQL 8 or later
- Git
- Visual Studio Code (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/saikarthik34/LocalKart.git
cd LocalKart
```

### 2. Configure MySQL

Create a database:

```sql
CREATE DATABASE localkart_db;
```

### 3. Configure Backend

Copy `src/main/resources/application-example.properties` to `src/main/resources/application.properties`.

Update the MySQL username, password, and JWT secret with your own values.

### 4. Run Backend

From the project root, execute:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend URL: `http://localhost:8081`

### 5. Run Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5174`

## Security

- Passwords are encrypted using BCrypt.
- JWT tokens are used for authentication.
- Role-based authorization separates customer and seller permissions.
- Sellers can manage their own products.
- Sensitive configuration files are excluded from version control.

## Future Enhancements

- Product search and advanced filtering
- Online payment integration
- Delivery tracking
- Admin dashboard
- Seller analytics and reporting

## Author

**Sai Karthik Konda**

GitHub: https://github.com/saikarthik34

Project Repository: https://github.com/saikarthik34/LocalKart

---

*LocalKart — Supporting local businesses through technology.*