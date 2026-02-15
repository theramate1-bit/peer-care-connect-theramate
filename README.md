# Peer Care Connect / Theramate

A comprehensive platform connecting clients with verified therapists through a credit-based economy, featuring real-time messaging, location-based matching, and advanced scheduling capabilities.

## 🏗️ Monorepo Structure

This repository contains multiple projects:

- **[peer-care-connect](./peer-care-connect/)** - Main therapy platform (React + Vite + Supabase)
- **[ai-ugc-creator](./ai-ugc-creator/)** - AI video generation tool (Next.js + InstantDB)
- **[theramate-ios-client](./theramate-ios-client/)** - iOS mobile application

## 🚀 Quick Start

### Main Platform (Peer Care Connect)

```bash
cd peer-care-connect
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

See [peer-care-connect/README.md](./peer-care-connect/README.md) for detailed setup.

### Documentation

- [Getting Started Guide](./docs/getting-started/development-setup.md)
- [Environment Setup](./docs/getting-started/environment-setup.md)
- [Full Documentation Index](./docs/README.md)

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- [Getting Started](./docs/getting-started/) - Setup and installation
- [Architecture](./docs/architecture/) - System design and structure
- [Features](./docs/features/) - Feature documentation
- [API](./docs/api/) - API reference
- [Deployment](./docs/deployment/) - Deployment guides
- [Testing](./docs/testing/) - Testing documentation
- [Contributing](./docs/contributing/) - Contribution guidelines

## 🛠️ Technology Stack

### Main Platform
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Styling:** Tailwind CSS + Shadcn/ui
- **Payments:** Stripe
- **Testing:** Jest + Playwright

### Other Projects
- **AI UGC Creator:** Next.js + InstantDB
- **iOS Client:** React Native / Expo

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 📋 Project Status

- ✅ Core platform features implemented
- ✅ Payment integration complete
- ✅ Real-time messaging working
- ✅ Booking system functional
- ✅ Testing infrastructure in place
- ✅ CI/CD pipeline configured

## 🔐 Security

Please review our [Security Policy](./SECURITY.md) before reporting security vulnerabilities.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🗺️ Roadmap

See [CHANGELOG.md](./CHANGELOG.md) for version history and planned features.

## 📞 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/your-username/peer-care-connect/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/peer-care-connect/discussions)

## 🌟 Features

### Core Platform Features
- Credit-based economy for therapy sessions
- Real-time messaging between clients and therapists
- Professional verification system
- Advanced scheduling with recurring sessions
- Location-based therapist matching
- Stripe payment processing
- SOAP notes and treatment documentation
- Client progress tracking
- Practice analytics dashboard

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/peer-care-connect.git
   cd peer-care-connect
   ```

2. **Set up the main project**
   ```bash
   cd peer-care-connect
   npm install
   cp .env.example .env.local
   # Configure your environment variables
   npm run dev
   ```

3. **Read the documentation**
   - [Development Setup](./docs/getting-started/development-setup.md)
   - [Environment Configuration](./docs/getting-started/environment-setup.md)
   - [Architecture Overview](./docs/architecture/system-overview.md)

## 📊 Project Structure

```
.
├── peer-care-connect/      # Main platform
├── ai-ugc-creator/         # AI video tool
├── theramate-ios-client/   # iOS app
├── docs/                    # Documentation
├── .github/                 # GitHub workflows and templates
└── README.md               # This file
```

## 🧪 Testing

```bash
# Run all tests
cd peer-care-connect
npm run test:all

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

See [Testing Guide](./docs/testing/testing-guide.md) for more information.

## 🚢 Deployment

See [Deployment Guide](./docs/deployment/deployment-guide.md) for deployment instructions.

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a list of changes and version history.

---

**Built with ❤️ for the therapy community**
