# 🏋️ Gym Management System API

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <your_token>
```

---

## 📝 **API Endpoints**

### **Authentication**

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gym.com",
  "password": "admin123456"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "user": { ... }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Password
```http
PUT /api/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123456",
  "newPassword": "NewSecurePassword123!"
}
```

---

### **Members Management**

#### Create Member (Admin Only)
```http
POST /api/members
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+91 9876543210",
  "email": "john@example.com",
  "membershipType": "monthly",
  "joiningDate": "2026-01-17",
  "membershipFee": 1500,
  "gender": "male",
  "address": "123 Main Street",
  "city": "Mumbai"
}

Response:
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "member": {
      "memberId": "GYM-2026-0001",
      "name": "John Doe",
      "expiryDate": "2026-02-17T00:00:00.000Z",
      ...
    }
  }
}
```

#### Get All Members
```http
GET /api/members?page=1&limit=50&status=active&search=John
Authorization: Bearer <token>
```

#### Get Single Member
```http
GET /api/members/:id
Authorization: Bearer <token>
```

#### Update Member (Admin Only)
```http
PUT /api/members/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "+91 9876543999",
  "address": "New Address"
}
```

#### Delete Member (Admin Only)
```http
DELETE /api/members/:id
Authorization: Bearer <admin_token>
```

#### Get Members Expiring Soon
```http
GET /api/members/expiring-soon?days=7
Authorization: Bearer <token>
```

---

### **Payments**

#### Record Payment (Admin Only)
```http
POST /api/payments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "memberId": "696b09bd76cbaaa1f40eec49",
  "amount": 1500,
  "paymentMode": "cash",
  "validFrom": "2026-01-17",
  "validUntil": "2026-02-17",
  "remarks": "Monthly membership"
}

Response:
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment": {
      "paymentId": "PAY-202601-0001",
      ...
    }
  }
}
```

#### Get All Payments
```http
GET /api/payments?page=1&limit=50&startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

#### Get Payment Statistics
```http
GET /api/payments/stats?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

---

### **Attendance**

#### Check-in Member
```http
POST /api/attendance/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "memberId": "696b09bd76cbaaa1f40eec49",
  "remarks": "Morning workout"
}
```

#### Check-out Member
```http
PUT /api/attendance/checkout/:attendanceId
Authorization: Bearer <token>
```

#### Get Today's Attendance
```http
GET /api/attendance/today
Authorization: Bearer <token>
```

#### Get Attendance Statistics
```http
GET /api/attendance/stats?days=7
Authorization: Bearer <token>
```

---

### **Dashboard & Analytics**

#### Get Dashboard Stats
```http
GET /api/dashboard/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalMembers": 2,
      "activeMembers": 2,
      "expiringSoon": 0,
      "todayAttendance": 2,
      "monthlyRevenue": 3000,
      "todayRevenue": 3000,
      "revenueGrowth": 0
    },
    "recentPayments": [...],
    "recentCheckIns": [...]
  }
}
```

#### Get Revenue Chart
```http
GET /api/dashboard/revenue-chart?months=6
Authorization: Bearer <token>
```

#### Get Attendance Chart
```http
GET /api/dashboard/attendance-chart?days=30
Authorization: Bearer <token>
```

#### Get Membership Distribution
```http
GET /api/dashboard/membership-distribution
Authorization: Bearer <token>
```

---

### **Messaging System**

#### Generate Message Drafts (Admin Only)
```http
POST /api/messages/drafts/generate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "type": "welcome"
}

Types: "welcome", "expiry", "payment", "offer", "custom"
```

#### Get Message Drafts
```http
GET /api/messages/drafts?status=draft&page=1&limit=50
Authorization: Bearer <token>
```

#### Update Draft (Admin Only)
```http
PUT /api/messages/drafts/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "message": "Updated message content here"
}
```

#### Send Messages (Admin Only)
```http
POST /api/messages/send
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "draftIds": ["696b09e576cbaaa1f40eecac"],
  "channel": "sms"
}
```

#### Delete Drafts (Admin Only)
```http
DELETE /api/messages/drafts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "draftIds": ["696b09e576cbaaa1f40eecac"]
}
```

#### Get Message Logs
```http
GET /api/messages/logs?page=1&limit=50&startDate=2026-01-01
Authorization: Bearer <token>
```

---

### **Data Export**

#### Export Members (CSV)
```http
GET /api/export/members?status=active
Authorization: Bearer <token>

Downloads: members_2026-01-17.csv
```

#### Export Payments (CSV)
```http
GET /api/export/payments?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>

Downloads: payments_2026-01-17.csv
```

#### Export Attendance (CSV)
```http
GET /api/export/attendance?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>

Downloads: attendance_2026-01-17.csv
```

---

## 🔐 Default Credentials

**Admin:**
- Email: `admin@gym.com`
- Password: `admin123456`

**Trainer:**
- Email: `trainer@gym.com`
- Password: `trainer123456`

⚠️ **Change these passwords immediately in production!**

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Paginated Response
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "totalPages": 10,
  "currentPage": 1,
  "data": { ... }
}
```

---

## 🚀 Getting Started

1. Clone repository
2. Install dependencies: `npm install`
3. Setup `.env` file
4. Seed database: `npm run seed`
5. Start server: `npm run dev`

---

## 📞 Support

For issues or questions, contact your development team.

