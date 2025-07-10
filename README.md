# 📘 CodBlog — A Full-Stack AI-Powered Social Blogging Platform

**CodBlog** is a modern, full-featured blogging and social platform built with **Django REST Framework** and **React.js**, designed to provide users a powerful space to create, share, and engage with content — enhanced by AI, real-time features, and social interactions.


## 🔥 Key Features

### 📝 **Rich Text Post Creation with EditorJS**
- **Block-based editing** using EditorJS for clean, structured content creation
- Support for multiple content types: text, images, headings, code blocks, lists, and more
- **Seamless editing experience** with real-time preview
- **Edit Post functionality** with the same powerful editor interface

### 🤖 **AI-Powered Writing Assistant**
- **Integrated AI Chatbot** powered by Gemini API in Add Post and Edit Post pages
- **Content enhancement features**:
  - Brainstorm ideas and suggest topics
  - Generate compelling titles
  - Improve readability and grammar
  - Summarize content for better engagement
- **Reduces writer's block** and enhances creativity

### 💬 **Advanced Comment System**
- **Nested replies** with unlimited depth for threaded discussions
- **Real-time comment updates** using WebSocket connections
- **Structured recursively** — root-level comments with attached child replies
- **User-friendly interface** for easy conversation flow

### ❤️ **Engagement Features**
- **Like System**: Users can like posts they enjoy
- **Save for Later**: Bookmark posts for future reading
- **Personal saved list** accessible from user dashboard
- **Real-time like count updates**

### 👥 **Social Networking**
- **Follow/Unfollow System**: Build personalized networks
- **Following Feed**: Curated content from followed users
- **Explore Users**: Discover new creators and expand your network
- **User profiles** with comprehensive information and post history

### 🔔 **Real-Time Notifications**
- **Live notifications** using Django Channels and WebSockets
- **Notification types**:
  - New followers
  - Likes on posts
  - Comments and replies
- **Redis-backed** channel layer for scalable real-time communication
- **Persistent notifications** with read/unread status

### 🔐 **Authentication & Security**
- **JWT-based authentication** using `djangorestframework-simplejwt`
- **Google OAuth integration** for seamless social login
- **Secure user profiles** with customizable profile images
- **Protected routes** and user-specific content access

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Axios, TailwindCSS, Context API, Redux Toolkit |
| **Editor** | EditorJS (block-based content creation) |
| **AI Assistant** | Gemini API (content enhancement) |
| **Backend** | Django, Django REST Framework |
| **Real-time** | Django Channels + Redis |
| **Authentication** | JWT via `djangorestframework-simplejwt` | Google Authentication
| **Database** | PostgreSQL |




## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- PostgreSQL
- Redis Server

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/amrazz/cod-blog.git
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   cd codblog
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirement.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   SECRET=your-secret-key
   DEBUG=True
   DATABASE_NAME=YOUR DB NAME
   DATABASE_USER=YOUR DB USER 
   DATABASE_PASSWORD=YOUR DB PASSWORD
   REDIS_URL=redis://localhost:6379/0
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. **Database Setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Start services**
   ```bash
   # Terminal 1: Django server
   python manage.py runserver

   # Terminal 3: Redis server
   redis-server
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd Frontend/codblog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_WEBSOCKET_URL=ws://localhost:8000
   VITE_GEMINI_API_KEY=YOUR GEMINI API
   VITE_GOOGLE_CLIENT_ID=YOUR GOOGLE CLIENT ID
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### For Users
1. **Register/Login** using email or Google OAuth
2. **Create posts** using the rich EditorJS interface
3. **Get AI assistance** while writing for better content
4. **Engage** with posts through likes, comments, and saves
5. **Follow users** to build your personalized feed
6. **Receive notifications** for interactions in real-time



## 📊 Database Schema

### Core Models
- **User**: Extended Django user model with profile information
- **Post**: Blog posts with rich content, likes, and save functionality
- **Comment**: Nested comment system with parent-child relationships
- **Follow**: User following relationships
- **Notification**: Real-time notification system
- 


## 🔮 Future Enhancements

### Planned Features
- [ ] **Mobile App** (React Native)
- [ ] **Post Categories** and tagging system
- [ ] **Email Notifications** for important updates
- [ ] **Analytics Dashboard** for content creators
- [ ] **Multi-language Support**
- [ ] **Post Scheduling** functionality

### Technical Improvements
- [ ] **Docker Containerization**
- [ ] **CI/CD Pipeline** setup
- [ ] **Performance Optimization**
- [ ] **SEO Enhancements**
- [ ] **Progressive Web App** features
- [ ] **Advanced Caching** strategies

## 👨‍💻 Contributors

### ✨ Amraz Rafeeque  
- Integrated core features across frontend and backend  
- Designed and developed intuitive UI/UX components  
- Managed seamless communication between Django and React  

### ⚙️ Mhd Asjad  
- Built and optimized the notification system  
- Implemented real-time interactions using WebSockets  
- Handled collaboration logic and state synchronization  


## 🛠️ Development Background

CodBlog started as a personal project to rebuild confidence after a long break from development. It served as both a **skill refresher** and a **technical challenge** to implement real-world application logic using:

- **Class-based views** for complex business logic
- **Nested model relationships** for social features
- **Real-time communication** using WebSockets
- **AI integration** for content enhancement
- **Modern frontend practices** with React and Redux

The project later evolved into a collaborative effort, incorporating advanced features like Redis-based real-time notifications and comprehensive social networking capabilities.

## 🚀 Performance & Scalability

### Current Optimizations
- **Database indexing** for faster queries
- **Redis caching** for session management
- **Lazy loading** for improved frontend performance
- **Pagination** for large datasets
- **Optimized API responses** with serializers

### Scalability Considerations
- **Horizontal scaling** ready with Redis
- **Database connection pooling**
- **Static file serving** optimization
- 

## 🔒 Security Features

- **JWT token authentication** with refresh mechanism
- **CORS configuration** for secure cross-origin requests
- **Input validation** and sanitization
- **SQL injection** protection through Django ORM
- **XSS protection** with content security policies
- **Rate limiting** for API endpoints

## 📝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write comprehensive tests for new features
- Update documentation for any API changes
- Follow the existing code structure and patterns



## 🙏 Acknowledgments

- **EditorJS** for the amazing block-based editor
- **Django REST Framework** for robust API development
- **React.js** community for excellent frontend tools
- **Google Gemini API** for AI-powered content assistance
- **Redis** for reliable real-time communication
- **TailwindCSS** for beautiful, responsive design


---

**Built with ❤️ by the CodBlog Team**