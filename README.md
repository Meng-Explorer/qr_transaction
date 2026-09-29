# 💳 ABA PayWay KHQR Payment Gateway (Spring Boot & React)

A full-stack payment gateway integration connecting **Spring Boot**, **PostgreSQL**, and **React (Vite)** with **ABA PayWay KHQR Sandbox & Production API**.

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x%20%2F%204.x-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Features

- **🚀 Dynamic KHQR Generation:** Generates real ABA PayWay KHQR strings and QR images dynamically via the ABA PayWay API (`/api/payment-gateway/v1/payments/generate-qr`).
- **🔐 HMAC-SHA512 Security:** Compliant with ABA PayWay’s 18-field hashing algorithm for secure server-to-server request signing.
- **🔄 Polling & Status Verification:** Integrated transaction checking (`/check-transaction-2`) to verify payment status in real-time.
- **💾 PostgreSQL Transaction History:** Stores every generated QR transaction with transaction ID, amount, timestamp, status, and raw hash into PostgreSQL.
- **🎨 Premium UI / UX:** Built with React 19 & Vite, featuring a modern dark luxury glassmorphism design, authentic KHQR display card, currency switcher (USD / KHR), preset buttons, and countdown timer.
- **🌐 Full CORS & Proxy Setup:** Zero CORS friction with backend CORS mappings and Vite development proxy configured.

---

## 🏗️ System Architecture

```text
+-----------------------+           +--------------------------+           +-----------------------+
|                       |  /api/*   |                          |  HTTPS    |                       |
|   React 19 Frontend   | --------> |   Spring Boot Backend    | --------> |   ABA PayWay Gateway  |
|     (Port 5173)       |  (Proxy)  |       (Port 8082)        | (SHA-512) |  (Sandbox/Production) |
|                       |           |                          |           |                       |
+-----------------------+           +--------------------------+           +-----------------------+
                                                 |
                                                 | JPA / Hibernate
                                                 v
                                    +--------------------------+
                                    |                          |
                                    |   PostgreSQL Database    |
                                    |       (Port 5432)        |
                                    |                          |
                                    +--------------------------+
```

---

## 📁 Project Structure

```text
qr-transaction/
├── src/main/java/com/example/qr_transaction/
│   ├── config/
│   │   └── WebConfig.java                  # CORS and MVC configuration
│   ├── controller/
│   │   └── QrController.java               # REST Endpoints (/generate, /check, /history)
│   ├── dto/
│   │   ├── Request/QrRequest.java          # ABA PayWay request payload DTO
│   │   └── Response/QrResponse.java        # ABA PayWay response DTO (status, qrString, image)
│   ├── exception/
│   │   └── GlobalExceptionHandler.java     # Unified API error handling
│   ├── models/
│   │   └── QrEntity.java                   # PostgreSQL JPA entity for qr_transactions
│   ├── repository/
│   │   └── QrRepository.java               # Spring Data JPA Repository
│   ├── service/
│   │   ├── QrService.java                  # Service interface
│   │   └── Imp/QrServiceImp.java           # ABA HMAC-SHA512 & PayWay API implementation
│   └── QrTransactionApplication.java       # Main Spring Boot Application
│
├── src/main/resources/
│   └── application.properties              # Port, Database & ABA API credentials
│
├── frontend/                               # React 19 + Vite Application
│   ├── src/
│   │   ├── App.jsx                         # Main Payment UI & KHQR Card
│   │   ├── index.css                       # Modern Glassmorphism & KHQR Styles
│   │   └── main.jsx                        # Entry point
│   ├── index.html                          # Meta & Google Fonts
│   ├── package.json                        # Dependencies (lucide-react, qrcode.react, canvas-confetti)
│   └── vite.config.js                      # Vite server with backend API proxy
│
├── pom.xml                                 # Maven dependencies & compiler config
└── README.md                               # Project documentation
```

---

## ⚙️ Prerequisites

Before running the project, make sure you have installed:
- **Java 21+** (`java -version`)
- **Node.js 18+** & **npm** (`node -v`, `npm -v`)
- **PostgreSQL 14+** running on `localhost:5432`

---

## 🚀 Getting Started

### 1. Database Setup
Create a PostgreSQL database named `Qr_db`:
```sql
CREATE DATABASE "Qr_db";
```

### 2. Configure Backend Credentials
Open `src/main/resources/application.properties` and verify your database and ABA credentials:

```properties
server.port=8082

# Database Connection
spring.datasource.url=jdbc:postgresql://localhost:5432/Qr_db
spring.datasource.username=postgres
spring.datasource.password=123
spring.jpa.hibernate.ddl-auto=update

# ABA PayWay Configuration (Sandbox)
aba.payway.api.url=https://checkout-sandbox.payway.com.kh
aba.payway.merchant-id=YOUR_MERCHANT_ID
aba.payway.api-key=YOUR_API_KEY
```

### 3. Run the Spring Boot Backend
From the root directory:

**Windows (PowerShell):**
```powershell
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**
```bash
./mvnw spring-boot:run
```
The backend will start at: `http://localhost:8082`

### 4. Run the React Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 📡 API Endpoints

### 1. Generate QR Code
- **URL:** `POST /api/v1/qr/generate`
- **Request Body (JSON):**
  ```json
  {
    "tran_id": "TXN-998811",
    "amount": "2.50",
    "currency": "USD",
    "first_name": "Sokha",
    "last_name": "Tim"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "tran_id": "TXN-998811",
    "amount": "2.50",
    "currency": "USD",
    "qrString": "00020101021230510016abaakhppxxx@abaa...",
    "qrImage": "data:image/png;base64,iVBORw0KGgo...",
    "abapay_deeplink": "abamobilebank://ababank.com?type=payway&qrcode=..."
  }
  ```

### 2. Check Transaction Status
- **URL:** `POST /api/v1/qr/check`
- **Request Body (JSON):**
  ```json
  {
    "tran_id": "TXN-998811"
  }
  ```
- **Response:** Returns real-time transaction approval status from ABA PayWay.

### 3. Get Transaction History
- **URL:** `GET /api/v1/qr/history`
- **Response:** Array of transaction records stored in PostgreSQL.

---

## 🔐 Sandbox vs Production

| Environment | API URL | Mobile Scanning |
| :--- | :--- | :--- |
| **Sandbox** | `https://checkout-sandbox.payway.com.kh` | ABA Sandbox Mobile App / Simulator |
| **Production** | `https://checkout.payway.com.kh` | Real ABA Mobile & Any Bakong KHQR App |

> [!NOTE]
> When testing in **Sandbox mode**, real ABA Mobile apps will display `"Transaction not found"` because the real app connects exclusively to the Production server. To scan with real bank apps using real currency, switch to production credentials issued by ABA Bank (`paywaysales@ababank.com`).

---

## 📤 Push to GitHub

To push this repository to your GitHub account:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files (node_modules and build files are ignored via .gitignore)
git add .

# 3. Commit your changes
git commit -m "feat: complete ABA PayWay KHQR payment gateway with Spring Boot and React"

# 4. Rename current branch to main
git branch -M main

# 5. Add your remote repository URL (replace with your repo URL)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
