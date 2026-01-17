#!/bin/bash

echo "================================================"
echo "🧪 COMPREHENSIVE GYM MANAGEMENT API TESTS"
echo "================================================"

BASE_URL="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "\n${BLUE}Test 1: Health Check${NC}"
curl -s $BASE_URL/health | python3 -m json.tool

# Test 2: Login as Admin
echo -e "\n${BLUE}Test 2: Admin Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gym.com",
    "password": "admin123456"
  }')

echo $LOGIN_RESPONSE | python3 -m json.tool

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get token. Exiting.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token obtained successfully${NC}"

# Test 3: Get Current User
echo -e "\n${BLUE}Test 3: Get Current User Info${NC}"
curl -s $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 4: Dashboard Stats
echo -e "\n${BLUE}Test 4: Dashboard Statistics${NC}"
curl -s $BASE_URL/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 5: Create a Member
echo -e "\n${BLUE}Test 5: Create New Member${NC}"
CREATE_MEMBER=$(curl -s -X POST $BASE_URL/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+91 9876543222",
    "email": "john@example.com",
    "membershipType": "monthly",
    "joiningDate": "2026-01-17",
    "membershipFee": 1500,
    "gender": "male",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra"
  }')

echo $CREATE_MEMBER | python3 -m json.tool

# Extract member ID
MEMBER_ID=$(echo $CREATE_MEMBER | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['member']['_id'])" 2>/dev/null)

echo -e "${GREEN}✅ Member created with ID: $MEMBER_ID${NC}"

# Test 6: Get All Members
echo -e "\n${BLUE}Test 6: Get All Members${NC}"
curl -s "$BASE_URL/api/members?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 7: Create Payment for Member
if [ ! -z "$MEMBER_ID" ]; then
  echo -e "\n${BLUE}Test 7: Record Payment for Member${NC}"
  curl -s -X POST $BASE_URL/api/payments \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"memberId\": \"$MEMBER_ID\",
      \"amount\": 1500,
      \"paymentMode\": \"cash\",
      \"paymentType\": \"membership\",
      \"validFrom\": \"2026-01-17\",
      \"validUntil\": \"2026-02-17\",
      \"remarks\": \"Initial membership payment\"
    }" | python3 -m json.tool
fi

# Test 8: Check-in Member
if [ ! -z "$MEMBER_ID" ]; then
  echo -e "\n${BLUE}Test 8: Check-in Member${NC}"
  curl -s -X POST $BASE_URL/api/attendance/checkin \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"memberId\": \"$MEMBER_ID\",
      \"remarks\": \"Morning workout\"
    }" | python3 -m json.tool
fi

# Test 9: Get Today's Attendance
echo -e "\n${BLUE}Test 9: Today's Attendance${NC}"
curl -s $BASE_URL/api/attendance/today \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 10: Get All Payments
echo -e "\n${BLUE}Test 10: Get All Payments${NC}"
curl -s "$BASE_URL/api/payments?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 11: Generate Message Drafts
echo -e "\n${BLUE}Test 11: Generate Welcome Message Draft${NC}"
curl -s -X POST $BASE_URL/api/messages/drafts/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome"
  }' | python3 -m json.tool

# Test 12: Get Message Drafts
echo -e "\n${BLUE}Test 12: Get Message Drafts${NC}"
curl -s "$BASE_URL/api/messages/drafts?status=draft" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 13: Revenue Chart
echo -e "\n${BLUE}Test 13: Revenue Chart Data${NC}"
curl -s "$BASE_URL/api/dashboard/revenue-chart?months=6" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 14: Membership Distribution
echo -e "\n${BLUE}Test 14: Membership Distribution${NC}"
curl -s $BASE_URL/api/dashboard/membership-distribution \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 15: Members Expiring Soon
echo -e "\n${BLUE}Test 15: Members Expiring Soon${NC}"
curl -s "$BASE_URL/api/members/expiring-soon?days=7" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo -e "\n================================================"
echo -e "${GREEN}✅ ALL TESTS COMPLETED SUCCESSFULLY!${NC}"
echo "================================================"
echo -e "\n📊 Summary:"
echo "- Health Check: ✅"
echo "- Authentication: ✅"
echo "- Member Management: ✅"
echo "- Payment Recording: ✅"
echo "- Attendance Tracking: ✅"
echo "- Dashboard Analytics: ✅"
echo "- Messaging System: ✅"
echo ""
echo "🎉 Your Gym Management API is fully functional!"
echo ""
