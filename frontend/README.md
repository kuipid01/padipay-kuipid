# Kuipid 🚀
**Your Peer-to-Peer Loan Infrastructure, Simplified.**

Kuipid is a professional lending infrastructure platform built for modern lenders. Whether you are a micro-finance institution or an informal lender, Kuipid provides the tools to manage applications, automate collections, and track repayments with zero operational headaches.

---

## ✨ Key Features

### 🏦 For Lenders
- **Custom Loan Landing Pages**: Create your own public loan application links (e.g., `Kuipid.com/your-slug`) in seconds.
- **Automated Collections**: Integration with **Paystack** for secure, automated recurring charges.
- **Verification Engine**: Built-in verification steps to ensure borrower credibility.
- **Rich Dashboard**: Track every app, individual application, and repayment schedule with real-time analytics.
- **Internal Notifications**: Automated email/SMS reminders for upcoming due dates.
- **Secure Auth**: Role-based access (Lender), password recovery, and profile management.

### 👤 For Borrowers
- **Seamless Application**: Interactive loan calculator and easy-to-fill forms.
- **Card Vaulting**: Securely authorize cards for automated, stress-free repayments.
- **Transparency**: Clear visibility into repayment schedules and loan terms.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [Neon Postgres](https://neon.tech/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Payments**: [Paystack API](https://paystack.com/)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kuipid01/Kuipid-kuipid.git
cd Kuipid
```

### 2. Install dependencies
```bash
bun install
# or
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following:

```env
# Database
DATABASE_URL=your_postgres_url

# Auth
SESSION_SECRET=your_32_char_secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components (Shadcn UI + Custom).
- `db/`: Database schema definitions and Drizzle configuration.
- `lib/`: Utility functions, authentication, and service clients (Paystack, Notifications).
- `public/`: Static assets.

---

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the modern lender.
