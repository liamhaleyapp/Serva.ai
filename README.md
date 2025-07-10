# Serva.ai Agent Site Builder

An AI-powered website generator that creates custom React applications for AI agents based on natural language prompts and agent configurations.

## Features

- 🤖 **AI-Powered Generation**: Uses GPT-4 to convert prompts into structured website plans
- 🎨 **Modern React Apps**: Generates TypeScript React applications with Tailwind CSS
- 🚀 **Instant Deployment**: Automatically deploys to Vercel with zero configuration
- 📊 **Project Tracking**: Logs all generated projects to Supabase for analytics
- 🎯 **Agent Integration**: Designed specifically for AI agent interfaces

## Architecture

```
User Prompt + Agent JSON
         ↓
   GPT-4 NTL Generation
         ↓
   React Code Generation
         ↓
   Vercel Deployment
         ↓
   Supabase Logging
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Vercel Configuration
VERCEL_TOKEN=your_vercel_token_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
```

### 3. Database Setup

Create a `projects` table in your Supabase database:

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  url TEXT NOT NULL,
  ntl JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

## API Usage

### Generate Site Endpoint

**POST** `/api/generate-site`

**Request Body:**
```json
{
  "prompt": "Create a customer support chatbot interface",
  "agent_json": {
    "name": "SupportBot",
    "capabilities": ["chat", "ticket_creation"],
    "description": "AI customer support assistant"
  },
  "api_key": "your_openai_api_key"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://your-site.vercel.app",
  "message": "Site generated and deployed successfully"
}
```

## Project Structure

```
├── pages/
│   ├── api/
│   │   └── generate-site.ts    # Main API endpoint
│   └── index.tsx              # Frontend interface
├── lib/
│   ├── gpt.ts                 # OpenAI integration
│   ├── codegen.ts             # Code generation logic
│   ├── vercel.ts              # Vercel deployment
│   └── supabase.ts            # Database operations
├── package.json
└── tsconfig.json
```

## How It Works

1. **Prompt Processing**: Takes a natural language prompt and agent configuration
2. **NTL Generation**: Uses GPT-4 to create a structured plan (NTL - Natural Language to Layout)
3. **Code Generation**: Converts the NTL plan into React TypeScript components
4. **Project Assembly**: Creates a complete Vite + React project with all necessary files
5. **Deployment**: Deploys the project to Vercel using their CLI
6. **Logging**: Records the project details in Supabase for tracking

## Generated Project Structure

Each generated project includes:
- React TypeScript components
- Tailwind CSS for styling
- Vite for build tooling
- Vercel configuration
- Responsive design
- Accessibility features

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 access | Yes |
| `VERCEL_TOKEN` | Vercel deployment token | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase anonymous key | Yes |

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel CLI (`npm i -g vercel`)
- Supabase account
- OpenAI API access

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub or contact the development team. 