# 🏦 Vault - Modern Banking Application

A sleek, modern banking web application built with vanilla JavaScript. Features a clean UI, secure PIN authentication, and comprehensive transaction management.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

### 🔐 Authentication
- **Sign Up** - Create account with name, mobile number, and 4-digit PIN
- **Login** - Secure login with mobile number and PIN verification
- **PIN Hashing** - PINs are hashed before storage for security

### 💰 Banking Operations
- **💵 Deposit** - Add funds to your account
- **💸 Withdraw** - Withdraw funds with balance validation
- **📲 Transfer** - Send money to other mobile numbers
- **⚠️ Large Transaction Alerts** - Confirmation for transactions above ₹50,000

### 📊 Account Management
- **📈 Real-time Balance** - Animated balance updates
- **📜 Transaction History** - Searchable transaction ledger
- **🔍 Transaction Search** - Filter transactions by type, reference, or amount
- **📊 Credit Score** - Dynamic credit score based on account balance

### 👤 Profile Management
- **✏️ Edit Name** - Update your display name
- **🔑 Change PIN** - Securely change your login PIN
- **🆔 Account Number** - Unique account number generation

### 🎨 User Experience
- **🌙 Modern Dark Theme** - Easy on the eyes
- **📱 Responsive Design** - Works on all devices
- **⚡ Skeleton Loading** - Smooth loading states
- **🎯 Form Validation** - Real-time input validation with helpful hints
- **🔔 Toast Notifications** - Instant feedback on actions

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for ES modules)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Cyberopsorg/Banking-Website.git
   cd Banking-Website
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Or using Node.js
   npx serve
   ```

3. **Open in browser**
   ```
   http://localhost:8080/app.html
   ```

---

## 📁 Project Structure

```
Banking-Website/
├── 📄 index.html      # Landing page
├── 📄 app.html        # Main banking application
├── 📜 app.js          # Application logic & event handlers
├── 📜 utils.js        # Utility functions (formatting, validation, storage)
├── 📜 constants.js    # Validation rules & error messages
└── 🎨 styles.css      # Styling & animations
```

---

## 🛡️ Security Features

| Feature | Description |
|---------|-------------|
| 🔒 PIN Hashing | PINs are hashed using a simple hash function |
| 🛡️ XSS Protection | User inputs are escaped before display |
| ⏱️ Debouncing | Prevents rapid-click exploits |
| ✅ Input Validation | Comprehensive validation on all inputs |
| 🚫 Self-Transfer Block | Cannot transfer to own account |

---

## 📋 Validation Rules

- **📛 Name**: 2-50 characters, no special HTML characters
- **📱 Mobile**: Supports Indian (+91), Kenyan (+254), and local formats
- **🔢 PIN**: Exactly 4 digits
- **💰 Amount**: Positive numbers up to ₹10,00,00,000 (10 Crore), max 2 decimals

---

## 🎯 Usage

### Creating an Account
1. Click on **Sign Up** tab
2. Enter your full name
3. Enter your mobile number (e.g., 9876543210 or +919876543210)
4. Create a 4-digit PIN
5. Click **Create Account**

### Making a Deposit
1. Go to **Deposit** section
2. Enter amount (e.g., 5000)
3. Click **Deposit**
4. Confirm if amount exceeds ₹50,000

### Transferring Money
1. Go to **Transfer** section
2. Enter recipient's mobile number
3. Enter amount
4. Click **Transfer**
5. Confirm large transactions

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: LocalStorage (browser-based)
- **Architecture**: ES Modules
- **Styling**: Custom CSS with CSS Variables

---

## 📸 Screenshots

### 🏠 Home Dashboard
- View balance with animated counter
- Quick access to all banking operations
- Recent transactions at a glance

### 📊 Credit Score
- Dynamic score calculation (300-850)
- Visual progress bar
- Score categories: Poor, Fair, Good, Excellent

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Cyberops**

- GitHub: [@Cyberopsorg](https://github.com/Cyberopsorg)

---

## 🙏 Acknowledgments

- 💡 Inspired by modern banking applications
- 🎨 Icons and emojis from native system fonts
- 📚 Built as an educational project

---

<p align="center">
  Made with ❤️ by Cyberops
</p>
