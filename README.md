<div align="center">
  <h1>🚀 Failio</h1>
  <p><strong>Embrace Your Mistakes. Learn. Grow.</strong></p>
  <p>An intelligent platform that helps you track your failures, process emotions, and receive AI-driven constructive feedback to turn setbacks into stepping stones.</p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
  ![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
  ![BullMQ](https://img.shields.io/badge/BullMQ-FF4081?style=for-the-badge&logo=redis&logoColor=white)
</div>

<hr/>

## ✨ Overview

**Failio** is a modern, full-stack web application designed to reframe how we perceive failure. By logging our mistakes, categorizing the emotions attached to them, and utilizing Advanced AI, Failio provides actionable, personalized insights to foster a growth mindset.

Built with cutting-edge web technologies and a focus on performance, scalability, and user experience. It serves as a prime showcase of integrating complex backend architectures (queues, AI, payments) into a seamless frontend experience.

## 🔥 Key Features

- **🤖 AI Failure Analysis:** Asynchronous background processing (using **BullMQ** + **Redis**) feeds user failures to **Google's Generative AI**, returning smart, constructive feedback without blocking the UI.
- **💳 Tiered Subscriptions:** Integrated with **Stripe** for fluid Free and Pro tier management, featuring customer and subscription syncing via webhooks.
- **🔐 Secure Authentication:** Powered by **NextAuth.js**, supporting custom credential logins, email verification (via **Nodemailer**), password resets, and role-based access control (User/Admin).
- **🌍 Internationalization (i18n):** Full support for multiple languages out of the box using `next-intl`.
- **📊 Detailed Tracking:** Categorize failures and tag them with multiple *emotions* to easily identify patterns in your personal or professional journey.
- **🎨 Modern UI/UX:** Styled using the latest **Tailwind CSS v4**, featuring dark/light mode functionality (`next-themes`), smooth toast notifications (`sonner`), and crisp iconography (`lucide-react`, `react-icons`).
- **✅ Robust Testing Environment:** Comprehensive unit and UI testing suite utilizing **Vitest**, specifically testing database operations and component rendering.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State/UI Validation:** Zod
- **Theming & i18n:** `next-themes`, `next-intl`

### Backend & Infrastructure
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/) (with `@prisma/adapter-pg`)
- **Authentication:** NextAuth.js (with custom Email Verification flow)
- **Background Jobs:** [BullMQ](https://docs.bullmq.io/) + [ioredis](https://github.com/redis/ioredis)
- **AI Integration:** Google Generative AI SDK (Gemini)
- **Mailing:** Nodemailer
- **Payments:** Stripe Node SDK

## 🏗️ Architecture Highlights

- **Asynchronous AI Processing:** To prevent Vercel serverless function timeouts and ensure a snappy UI, AI analysis is offloaded to a Redis-backed BullMQ queue. The UI accurately reflects real-time processing states (`NOT_STARTED` -> `PROCESSING` -> `COMPLETED`).
- **Type Safety End-to-End:** Utilizing Zod for schema validation on the client and server, seamlessly integrated with TypeScript and Prisma's generated types to ensure data integrity across the stack.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher recommended)
- PostgreSQL database
- Redis instance (for BullMQ)
- Stripe Developer Account (for payments)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/failio.git
   cd failio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file and populate it with your specific keys (see `Environment Variables` section).

4. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   # Seed the database with initial categories and emotions
   npm run prisma:seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

### 🧪 Testing
The project includes a robust testing setup. Run the test suite using:
```bash
npm run test          # Run headless tests
npm run test:ui       # Run tests with Vitest UI
npm run test:db:setup # Reset and seed test database
```

## ⚙️ Environment Variables

Your `.env.local` file must include the following keys to run successfully:
```env
# Database & Redis
DATABASE_URL=postgresql://user:pass@localhost:5432/failio
REDIS_URL=redis://localhost:6379

# Authentication (NextAuth)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# AI Setup
GOOGLE_AI_API_KEY=your_gemini_api_key

# Email setup config for Nodemailer
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

---
<p align="center">Designed and Developed with ❤️</p>
