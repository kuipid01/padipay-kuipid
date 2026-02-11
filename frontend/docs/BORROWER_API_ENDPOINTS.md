# Borrower API Endpoints Requirements

This document lists the endpoints required by the Borrower Frontend. All requests from the frontend are proxied through `/api/borrower/*` and appended with a `/borrower` suffix before reaching the backend.

The backend should identify the borrower using the **Bearer Token** (JWT) provided in the Authorization header.

## Base URL Logic
Frontend Proxy: `/api/borrower/[path]`
Backend Target: `BACKEND_URL/api/[path]/borrower`

---

### 1. Dashboard Overview
- **Endpoint**: `GET /api/overview/borrower`
- **Description**: Returns summary statistics for the borrower dashboard.
- **Response**:
  ```json
  {
    "activeLoansCount": 0,
    "totalBorrowedAmount": 0,
    "pendingPaymentsCount": 0,
    "overdueCount": 0
  }
  ```

### 2. Loan History
- **Endpoint**: `GET /api/loans/borrower`
- **Description**: Returns a list of all loans associated with the borrower.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "amount": 0,
      "status": "pending | active | completed | overdue",
      "createdAt": "ISO-8601",
      "dueDate": "ISO-8601"
    }
  ]
  ```

### 3. Change Password
- **Endpoint**: `PATCH /api/settings/password/borrower`
- **Description**: Allows the borrower to update their password.
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```

### 4. Payout Accounts (Banks)
- **List Banks**: `GET /api/banks/borrower`
- **Add Bank**: `POST /api/banks/borrower`
  - Body: `{ "bankName": "string", "accountNumber": "string", "accountName": "string" }`
- **Remove Bank**: `DELETE /api/banks/:id/borrower`

### 5. Notifications
- **Endpoint**: `GET /api/notifications/borrower`
- **Description**: Returns borrower-specific alerts and updates.

### 6. Authentication Check
- **Endpoint**: `GET /api/auth/me` (Already exists)
- **Description**: Returns current user context.
