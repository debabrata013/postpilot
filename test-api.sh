#!/bin/bash

# Colors for console output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000/api"
TEST_USER_ID="test-user-123"
CHAT_ID=""

echo -e "${BLUE}=== POSTPILOT API TEST SCRIPT ===${NC}\n"

# Test 1: Create a new chat
echo -e "${BLUE}TEST 1: Creating a new chat${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$TEST_USER_ID\", \"message\": \"Create a Twitter post about artificial intelligence\"}")

# Extract chat ID from response - fixed extraction method
CHAT_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*"' | head -1 | sed 's/"_id":"//;s/"//')

# Debug output
echo "Debug - Full response first 200 chars: ${CREATE_RESPONSE:0:200}"
echo "Debug - Extracted ID: $CHAT_ID"

if [ -n "$CHAT_ID" ]; then
  echo -e "${GREEN}✓ PASS: Chat created successfully${NC}"
  echo "Chat ID: $CHAT_ID"
  echo "Response (truncated): ${CREATE_RESPONSE:0:200}..."
else
  echo -e "${RED}✗ FAIL: Failed to create chat${NC}"
  echo "Response: $CREATE_RESPONSE"
fi
echo ""

sleep 2 # Add a delay between requests

# Test 2: Get chat by ID
if [ -n "$CHAT_ID" ]; then
  echo -e "${BLUE}TEST 2: Getting chat by ID${NC}"
  GET_RESPONSE=$(curl -s -X GET "$BASE_URL/chat/$CHAT_ID")
  
  if echo "$GET_RESPONSE" | grep -q "$CHAT_ID"; then
    echo -e "${GREEN}✓ PASS: Chat retrieved successfully${NC}"
    echo "Response (truncated): ${GET_RESPONSE:0:200}..."
  else
    echo -e "${RED}✗ FAIL: Failed to retrieve chat${NC}"
    echo "Response: $GET_RESPONSE"
  fi
  echo ""
else
  echo -e "${YELLOW}SKIP: Get Chat - No chat ID available${NC}"
  echo ""
fi

sleep 2 # Add a delay between requests

# Test 3: Update an existing chat
if [ -n "$CHAT_ID" ]; then
  echo -e "${BLUE}TEST 3: Updating an existing chat${NC}"
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/chat" \
    -H "Content-Type: application/json" \
    -d "{\"chatId\": \"$CHAT_ID\", \"message\": \"Can you make that post more engaging?\"}")
  
  if echo "$UPDATE_RESPONSE" | grep -q "Can you make that post more engaging?"; then
    echo -e "${GREEN}✓ PASS: Chat updated successfully${NC}"
    echo "Response (truncated): ${UPDATE_RESPONSE:0:200}..."
  else
    echo -e "${RED}✗ FAIL: Failed to update chat${NC}"
    echo "Response: $UPDATE_RESPONSE"
  fi
  echo ""
else
  echo -e "${YELLOW}SKIP: Update Chat - No chat ID available${NC}"
  echo ""
fi

sleep 2 # Add a delay between requests

# Test 4: Update chat title
if [ -n "$CHAT_ID" ]; then
  echo -e "${BLUE}TEST 4: Updating chat title${NC}"
  TITLE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/chat/$CHAT_ID" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Twitter AI Content\"}")
  
  if echo "$TITLE_RESPONSE" | grep -q "Twitter AI Content"; then
    echo -e "${GREEN}✓ PASS: Chat title updated successfully${NC}"
    echo "Response (truncated): ${TITLE_RESPONSE:0:200}..."
  else
    echo -e "${RED}✗ FAIL: Failed to update chat title${NC}"
    echo "Response: $TITLE_RESPONSE"
  fi
  echo ""
else
  echo -e "${YELLOW}SKIP: Update Chat Title - No chat ID available${NC}"
  echo ""
fi

sleep 2 # Add a delay between requests

# Test 5: List all chats for a user
echo -e "${BLUE}TEST 5: Listing all chats for a user${NC}"
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/chats?userId=$TEST_USER_ID")

if echo "$LIST_RESPONSE" | grep -q "chats"; then
  echo -e "${GREEN}✓ PASS: Chats listed successfully${NC}"
  echo "Response (truncated): ${LIST_RESPONSE:0:200}..."
else
  echo -e "${RED}✗ FAIL: Failed to list chats${NC}"
  echo "Response: $LIST_RESPONSE"
fi
echo ""

sleep 2 # Add a delay between requests

# Test 6: Get chat history with pagination
echo -e "${BLUE}TEST 6: Getting chat history with pagination${NC}"
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/chat/history?userId=$TEST_USER_ID&page=1&limit=5")

if echo "$HISTORY_RESPONSE" | grep -q "chats"; then
  echo -e "${GREEN}✓ PASS: Chat history retrieved successfully${NC}"
  echo "Response (truncated): ${HISTORY_RESPONSE:0:200}..."
else
  echo -e "${RED}✗ FAIL: Failed to retrieve chat history${NC}"
  echo "Response: $HISTORY_RESPONSE"
fi
echo ""

sleep 2 # Add a delay between requests

# Test 7: Delete a chat
if [ -n "$CHAT_ID" ]; then
  echo -e "${BLUE}TEST 7: Deleting a chat${NC}"
  DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/chat/$CHAT_ID")
  
  if echo "$DELETE_RESPONSE" | grep -q "deleted successfully"; then
    echo -e "${GREEN}✓ PASS: Chat deleted successfully${NC}"
    echo "Response: $DELETE_RESPONSE"
  else
    echo -e "${RED}✗ FAIL: Failed to delete chat${NC}"
    echo "Response: $DELETE_RESPONSE"
  fi
  echo ""
else
  echo -e "${YELLOW}SKIP: Delete Chat - No chat ID available${NC}"
  echo ""
fi

echo -e "${BLUE}=== API TESTS COMPLETED ===${NC}"
