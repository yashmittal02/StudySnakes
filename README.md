# StudySnakes 🐍🎓

**Turn your study notes into a game. Learn, play, and climb your way to the top!**

StudySnakes is an AI-powered gamified learning platform that transforms study notes into interactive multiple-choice flashcards inside a Snakes & Ladders-inspired game. Answer correctly to advance across the board, reinforce your knowledge through active recall, and make studying more engaging.

🚀 **Live Demo:** [StudySnakes](https://study-snakes-pyba.vercel.app/)

## ✨ Features

- **AI-Powered Flashcards:** Generate multiple-choice questions from uploaded `.txt` files or pasted study notes using Google's Gemini API.
- **Gamified Learning:** Play a Snakes & Ladders-inspired game where your answers influence your progress.
- **Personalized Profiles:** Track learning progress, XP, levels, and profile details.
- **Smart Feedback:** Submit suggestions and feedback to help improve the platform.
- **Dynamic Themes:** Switch between dark and light modes.
- **Responsive Interface:** Access the learning experience across desktop and mobile devices.
- **Authentication:** Includes sign-in and account-related functionality in the current codebase.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Full-stack application framework |
| React & TypeScript | User interface and application logic |
| Tailwind CSS | Styling and responsive design |
| Prisma ORM | Database access and data modeling |
| SQLite (local development) | Local database |
| PostgreSQL (production setup) | Hosted database, when configured |
| Google Gemini API | AI-powered flashcard generation |
| NextAuth.js | Authentication |
| Lucide React | Icons |
| Framer Motion | UI animations |

## 🚀 Getting Started

### Prerequisites

- Node.js compatible with your installed Next.js version
- npm
- A Google Gemini API key for AI-powered flashcard generation
- A database configured for your chosen environment

### 1. Clone the repository

```bash
git clone https://github.com/yashmittal02/StudySnakes.git
cd StudySnakes
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the variables required by your application.

```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_gemini_api_key"
NEXTAUTH_SECRET="your_generated_secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAILS="admin@example.com"
```

**Important:**
- The example above uses SQLite for local development. Use the provider and connection string supported by your actual Prisma schema.
- For production, configure a persistent hosted database and its connection string.
- Set `NEXTAUTH_URL` to your deployed HTTPS URL in production if required by your authentication configuration.
- `ADMIN_EMAILS` is optional unless your application uses it.
- Never commit `.env`, API keys, passwords, or authentication secrets to GitHub.

Generate a strong authentication secret using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configure the database

Inspect `prisma/schema.prisma` to confirm the configured database provider.

For an existing Prisma migration setup, apply migrations with:

```bash
npx prisma migrate deploy
```

If you're initializing a local SQLite database and your project does not yet have migrations, follow the development workflow appropriate to your schema. For example:

```bash
npx prisma db push
```

Generate the Prisma Client when required:

```bash
npx prisma generate
```

Use `migrate deploy` for production migrations when your project has committed Prisma migration files. Do not use `db push` as a substitute for a production migration workflow.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Production Deployment

StudySnakes can be deployed to [Vercel](https://vercel.com/).

1. Push your code to the GitHub repository.
2. Import the repository into Vercel.
3. Configure the required environment variables in Project Settings.
4. Configure a persistent production database compatible with your Prisma schema.
5. Apply the committed Prisma migrations.
6. Deploy and review the build logs.

**Production checklist:**

- [ ] All required environment variables are configured.
- [ ] The production database is reachable.
- [ ] Prisma Client generation succeeds.
- [ ] Database migrations complete successfully.
- [ ] AI flashcard generation works with the configured API key.
- [ ] Authentication and game persistence are tested if enabled.
- [ ] No secrets are exposed in client-side code or Git history.

Live application: [https://study-snakes-pyba.vercel.app/](https://study-snakes-pyba.vercel.app/)

## 📁 Project Structure

```text
StudySnakes/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── game/
│   │   ├── login/
│   │   ├── profile/
│   │   └── upload/
│   ├── components/
│   └── lib/
├── .env.example
├── package.json
└── README.md
```

*The structure above is representative. Actual routes and files may change as the project evolves.*

## 🔐 Security

- Keep API keys and secrets in environment variables.
- Never expose server-side credentials through public client-side variables.
- Use a persistent production database for user and game data.
- Protect administrative endpoints and validate incoming API requests.
- Verify authentication and authorization wherever account-based features are enabled.

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request with a clear description.

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you intend to publish the project under an open-source license.

---

**StudySnakes: Make every answer count. 🐍🎯**
