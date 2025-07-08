# Bayt Al Libaas - Modern E-commerce Platform

A full-featured e-commerce platform built with Next.js 14, featuring a modern tech stack and comprehensive functionality for both customers and administrators.

## 🌟 Features

### Customer Features
- **User Authentication**
  - Email & Password registration/login
  - Google OAuth integration
  - Password reset functionality
  - Secure session management

- **Shopping Experience**
  - Browse products by categories
  - Advanced product search and filtering
  - Product reviews and ratings
  - Edit/manage your reviews
  - Responsive product gallery
  - Detailed product information

- **Shopping Cart**
  - Real-time cart management
  - Persistent cart across sessions
  - Quick quantity updates
  - Price calculations

- **Order Management**
  - Secure checkout process
  - Order history tracking
  - Clear order history feature
  - Order status updates

- **User Profile**
  - Personal information management
  - Order history view
  - Review management
  - Address management

### Admin Features
- **Product Management**
  - Add/Edit/Delete products
  - Manage product categories
  - Image upload and management
  - Inventory tracking

- **Order Management**
  - View and process orders
  - Update order status
  - Clear order history
  - Export order data

- **User Management**
  - View user accounts
  - Manage user roles
  - Review user activities

- **Review Management**
  - Moderate product reviews
  - Remove inappropriate content
  - Track review metrics

- **Analytics Dashboard**
  - Sales statistics
  - User engagement metrics
  - Product performance tracking
  - Trending items analysis

## 🛠️ Tech Stack

- **Frontend**
  - Next.js 14
  - React 18
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Zustand (State Management)

- **Backend**
  - Next.js API Routes
  - MongoDB with Mongoose
  - NextAuth.js
  - Email Integration (Resend)

- **Development**
  - ESLint
  - TypeScript
  - Prettier
  - PostCSS

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bayt-al-libaas.git
   cd bayt-al-libaas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in required environment variables

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

## 💻 Environment Variables

Required environment variables:

\`\`\`
# MongoDB Connection
MONGODB_URI=your_mongodb_uri

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Email Configuration
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email
EMAIL_SERVER_PASSWORD=your_password
EMAIL_FROM=your_email
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- MongoDB for the database
- All contributors and supporters

## 📧 Contact

For any queries or support, please reach out to [aegiskyoshi@gmail.com]

---

Made by [Mohammad Aiman] 