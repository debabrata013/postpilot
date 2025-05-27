# PostPilot

PostPilot is an AI-powered platform for generating social media content. Users can ask for content ideas, get post suggestions, and manage their content creation workflow.

## Features

- AI-powered content generation for social media
- Chat history to review previous conversations
- Content suggestions for different platforms (Twitter, Instagram, LinkedIn)
- User-friendly interface with real-time responses

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env`:

```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the API

### Using the JavaScript Test Script

Run the JavaScript test script to test all API endpoints:

```bash
node test-api.js
```

### Using the Bash Test Script

Run the bash script to test all API endpoints using curl:

```bash
./test-api.sh
```

## API Endpoints

### Chat Management

- `POST /api/chat` - Create a new chat
- `PUT /api/chat` - Update an existing chat with a new message
- `GET /api/chat/:id` - Get a specific chat by ID
- `PATCH /api/chat/:id` - Update a chat's title
- `DELETE /api/chat/:id` - Delete a chat

### Chat Listing

- `GET /api/chats` - List all chats for a user
- `GET /api/chat/history` - Get paginated chat history for a user

## Project Structure

```
postpilot/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── history/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── chats/
│   │       └── route.ts
│   ├── page.tsx
│   └── layout.tsx
├── lib/
│   ├── gemini.ts
│   ├── mongodb.ts
│   └── utils.ts
├── models/
│   └── Chat.ts
├── public/
├── test-api.js
└── test-api.sh
```

## License

This project is licensed under the MIT License.
