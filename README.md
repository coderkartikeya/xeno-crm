# XenoCRM

A modern CRM platform built with Next.js, MongoDB, Redis, and NextAuth.js. XenoCRM provides customer and order management, campaign automation, AI-powered suggestions, and robust analytics for growing businesses.

## Features
- User authentication (email/password, GitHub, Google)
- Customer and order management dashboards
- Campaign creation and management (for customers and orders)
- AI-powered campaign suggestions (OpenAI integration)
- CSV import/export for customers and orders
- Redis caching for fast data access
- Campaign logs and analytics
- Responsive, modern UI with TailwindCSS and ShadCN UI

## Tech Stack
- Next.js (App Router)
- MongoDB (database)
- Redis (caching, logs)
- NextAuth.js (authentication)
- TailwindCSS, ShadCN UI, Framer Motion (UI/UX)
- OpenAI API (AI suggestions)

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/xenocrm.git
   cd xenocrm/client/project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in `client/project` with the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   REDIS_URL=redis://localhost:6379
   NEXTAUTH_SECRET=your_nextauth_secret
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

## Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm start` — Start the production server

## Folder Structure
- `src/app` — Main Next.js app code
- `src/app/api` — API routes (auth, customers, orders, campaigns, logs)
- `src/app/components` — UI components
- `src/app/lib` — Database and utility libraries
- `src/app/dashboard` — Dashboard pages (customers, orders, campaigns)

## Contact
For questions or support, open an issue or contact [yourname@yourdomain.com](mailto:kartikeyavats04@gmail.com).
