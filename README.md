# StudySnakes 🚀

RecallRush is a gamified learning platform that converts your study notes into a high-stakes "Snakes & Ladders" game. Powered by AI, it transforms raw text into interactive flashcards where correct answers propel you forward and mistakes drag you down.

## ✨ Features
- **AI Flashcard Generation**: Upload any `.txt` file or paste notes to generate semantic MCQs.
- **Recall Teal Rebrand**: A modern, high-tech interface optimized for readability and high-performance feel.
- **Personalized Profiles**: Track your XP, Level, and customize your profile with an avatar.
- **Smart Feedback System**: integrated suggestion tool to help us improve the platform.
- **Dynamic Themes**: Seamless switching between optimized Dark and Light modes.

## 🛠️ Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Create a `.env` file with:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
   NEXTAUTH_SECRET="generate-a-long-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   GEMINI_API_KEY="your_gemini_api_key"
   ADMIN_EMAILS="admin@example.com"
   ```

3. **Database Migration**:
   ```bash
   npx prisma migrate deploy
   ```

   Use a Neon pooled connection string for `DATABASE_URL` in Vercel. Keep
   `DIRECT_URL` as the unpooled Neon connection string if you run Prisma
   migrations from a CI/CD job.

   Generate a strong secret with:
   ```bash
   npx auth secret
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS (Teal Theme)
- **Auth**: NextAuth.js
- **Icons**: Lucide React
- **Animations**: Framer Motion
