
# PageTurner API

A REST API for a book review blog. Users can register, log in, and create, edit, or delete their own book review posts. Posts can be browsed and filtered by category.

- **Live app:** https://first-full-stack-application-for-x2ip.onrender.com
- **GitHub repo:** https://github.com/MartinEverett23/First-Full-Stack-Application-For-Pageturners.git

## Tech Stack

- Node.js / Express
- PostgreSQL with Sequelize ORM
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/MartinEverett23/First-Full-Stack-Application-For-Pageturners.git
   cd First-Full-Stack-Application-For-Pageturners
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your own values (database credentials or a `DATABASE_URL`, plus a `JWT_SECRET`).

4. Seed the database with sample users and posts (optional):
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Visit `http://localhost:3001` in your browser.