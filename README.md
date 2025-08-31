# 📦 Package Tracker

A modern full-stack web application for managing and tracking packages with detailed status history.  
The system allows users to create, update, and monitor packages across different statuses.

---

## 🚀 Features

- **Package Management** – Create, update, and view packages.
- **Status Tracking** – Track package lifecycle with statuses (`Created`, `Sent`, `Accepted`, `Returned`, `Canceled`).
- **Status History** – Each change is persisted with timestamp & description.
- **Confirmation Dialogs** – Prevent accidental status changes with confirmation modals.
- **Responsive UI** – Mobile-friendly design with Tailwind.

---

## 🛠️ Tech Stack

### **Frontend**

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) – fast modern frontend.
- [TypeScript](https://www.typescriptlang.org/) – type safety.
- [React Query (TanStack)](https://tanstack.com/query) – API data fetching & caching.
- [TailwindCSS](https://tailwindcss.com/) – styling.

### **Backend**

- [ASP.NET Core 8](https://dotnet.microsoft.com/) – REST API backend.

### **Tooling**

- [ESLint + Prettier](https://eslint.org/) – linting & formatting.

---

## ⚡ Getting Started

### 1 Clone Repository

```bash
git clone https://github.com/Oscar-Sherelis/package-tracker.git
cd package-tracker
```

### 2 Backend Setup

```bash
cd server
# Restore dependencies
dotnet restore

# Run API
dotnet run
```

### 3 Frontend Setup

```bash
cd client
# Install dependencies
npm install

# Run dev server
npm run dev
```

## 📌 Roadmap / Possible Enhancements

What could be added in the future:

🔐 Authentication & Authorization (e.g., JWT).

🌍 i18n / Localization support.

✅ Unit & Integration Tests with Jest + React Testing Library (frontend) and xUnit (backend).