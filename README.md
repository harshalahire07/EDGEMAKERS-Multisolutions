# EDGEMAKERS Multisolutions

Welcome to the official repository for **EDGEMAKERS Multisolutions**, a comprehensive facility management web application. This platform is designed to showcase services, manage content via a robust admin dashboard, and facilitate user engagement through contact forms and seamless navigation.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-3.4-38B2AC)

## 🌟 Features

- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
- **Dynamic Content Management**: Administrators can easily manage Services, Team Members, and Testimonials via the secure dashboard.
- **Role-Based Authentication**: Secure login system with distinct access for Admins and regular users.
- **Interactive Forms**: Integrated forms for service inquiries, job applications, and contact requests.
- **Modern UI/UX**: Built with Shadcn UI and Framer Motion for a premium, polished look and feel.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **State Management**: React Context (`AuthContext`)
- **Data Persistence**: LocalStorage (Simulated Database for Demo/Dev)
- **Forms**: React Hook Form + Zod Validation

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- **Node.js**: Ensure you have Node.js (LTS version) installed. [Download Here](https://nodejs.org/)

### Installation

1.  **Clone the repository** (or unzip the project folder):

    ```bash
    git clone https://github.com/your-username/edgemakers-multisolutions.git
    cd edgemakers-multisolutions
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Start the Development Server**:

    ```bash
    npm run dev
    ```

4.  **Access the Application**:
    Open your browser and navigate to [http://localhost:9002](http://localhost:9002).

## 🔐 Admin Access

This application includes a protected Admin Dashboard.

- **Login URL**: Click "Login" in the header or go to `/admin`.
- **Default Credentials**:
  - **Email**: `admin@edgemakers.com`
  - **Password**: `Admin@123`

> **Note**: For security, please change the default password in your environment variables or database settings before deployment.

## 📂 Project Structure

```
src/
├── app/                # Application pages and routing
│   ├── page.tsx        # Home page
│   ├── about/          # About page
│   ├── careers/        # Careers page
│   ├── admin/          # Admin Dashboard (Protected)
│   └── layout.tsx      # Main layout (Header, Footer)
├── components/         # Reusable UI components
│   ├── landing/        # Public facing components
│   ├── admin/          # Dashboard components
│   └── ui/             # Shadcn UI primitives
├── lib/                # Utilities and data types
│   ├── data.ts         # Static data
│   └── database.ts     # LocalStorage wrapper
└── contexts/           # React Contexts (e.g., Auth)
```

## 📖 Documentation

Detailed documentation can be found in the `docs/` directory:

- [Authentication Guide](./docs/AUTHENTICATION.md)
- [Database Schema](./docs/DATABASE.md)
- [Security Features](./docs/SECURITY.md)
- [Testing Guide](./docs/TESTING.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by [Your Name/EDGEMAKERS Team]
