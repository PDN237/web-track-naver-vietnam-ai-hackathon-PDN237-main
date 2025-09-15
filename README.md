[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)
# StudyNote – AI-Powered Task Management App

A modern, intelligent task management application designed for Vietnamese students, featuring voice recognition, AI-powered task creation, calendar integration, and automated email scheduling.

## 🚀 Project Setup & Usage

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Modern web browser with microphone support

### Installation & Running
```bash
# Clone the repository
git clone <repository-url>
cd web-track-naver-vietnam-ai-hackathon-PDN237-main

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:5173`

## 🔗 Live Demo
[Vercel Deployment](https://web-track-naver-vietnam-ai-hackathon-pdn237-main.vercel.app/)

## 🎥 Demo Video
[Demo Video Link](https://youtu.be/yEZrtL_u3OE) 

## 💻 Project Overview

### Core Features

#### 📝 Task Management (CRUD)
- **Create Tasks**: Add new tasks with title, description, due date, priority, and category
- **Read Tasks**: View all tasks with filtering and search capabilities
- **Update Tasks**: Edit existing tasks (double-click to edit)
- **Delete Tasks**: Remove tasks with confirmation dialog
- **Status Management**: Update task status (Todo → In Progress → Done)

#### 🎤 Voice Recognition & AI Integration
- **Voice Commands**: Navigate between pages using voice commands
  - "mở lịch" → Open Calendar
  - "mở analytics" → Open Analytics
  - "mở tasks" → Open Tasks page
  - "mở email" → Open Email Schedule
- **AI Task Creation**: Use natural language to create tasks via voice
- **Gemini AI Integration**: Powered by Google Generative AI for intelligent voice processing

#### 📅 Calendar View
- **Monthly Calendar**: Visual representation of tasks by date
- **Recurring Tasks**: Support for daily, weekly, and monthly recurrence
- **Multi-date Selection**: Select multiple dates to create recurring tasks
- **Task Details Modal**: Click on dates to view task details

#### 📊 Analytics Dashboard
- **Interactive Charts**: Bar, pie, and line charts using Chart.js
- **Task Statistics**: Distribution by status, priority, and category
- **Date Range Filtering**: Analyze tasks within specific time periods
- **Real-time Updates**: Charts update automatically as tasks change

#### 📧 Email Scheduling
- **Automated Daily Emails**: Send daily task schedules via email
- **Custom Email Templates**: Beautiful HTML email templates
- **EmailJS Integration**: Serverless email sending
- **Recipient Management**: Save and manage email addresses

### Unique Features

#### 🤖 AI-Powered Voice Processing
- Natural language understanding using Gemini 1.5-flash
- Vietnamese language support for voice commands
- Intelligent task information extraction from speech
- Context-aware navigation commands

#### 🔔 Smart Notifications
- Automatic task status updates based on due dates
- Overdue task detection and notifications
- Reminder system for approaching deadlines
- Real-time status updates every minute

#### 🔄 Advanced Recurrence System
- Flexible recurrence patterns (daily, weekly, monthly)
- Multi-date selection for bulk recurrence setup
- End date configuration for recurring tasks
- Automatic task generation based on patterns

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **React Router** for client-side routing

### UI & Styling
- **CSS Modules** with custom responsive design
- **Lucide React** for consistent iconography
- **Custom CSS Variables** for theming

### Data Management
- **LocalStorage** for client-side data persistence
- **Custom Database Layer** (`src/db.ts`) with async operations
- **TypeScript Interfaces** for type-safe data structures

### Third-Party Integrations
- **Google Generative AI (Gemini)** for voice processing
- **React Speech Recognition** for voice input
- **EmailJS** for email functionality
- **Chart.js** for data visualization
- **React DatePicker** for date selection

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type checking
- **Vite** for build optimization

## 📁 Project Structure

```
src/
├── App.tsx                 # Main application component
├── App.css                 # Main application styles
├── main.tsx               # Application entry point
├── index.css              # Global styles
├── vite-env.d.ts          # Vite type definitions
├── db.ts                  # Database operations & types
├── AnalyticsPage.tsx      # Analytics dashboard
├── AnalyticsPage.css      # Analytics page styles
├── CalendarPage.tsx       # Calendar view
├── CalendarPage.css       # Calendar page styles
├── EmailSchedulePage.tsx  # Email scheduling
├── EmailSchedulePage.css  # Email page styles
└── assets/                # Static assets
```

## 🗄️ Database Schema

### Task Structure
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;        // ISO date string
  status: "todo" | "in-progress" | "done" | "overdue";
  priority: "low" | "medium" | "high";
  category: "study" | "work" | "personal";
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: string;
  };
}
```

### Data Storage
- **LocalStorage** for persistence
- **JSON format** for data serialization
- **Async operations** with Promise-based API
- **Automatic ID generation** using timestamps

## 🚀 Usage Guide

### Getting Started
1. **Setup**: Install dependencies and start the development server
2. **Navigation**: Use the sidebar to navigate between different views
3. **Voice Control**: Click the microphone button to use voice commands

### Task Management
1. **Add Task**: Click the "+" button or use voice command
2. **Edit Task**: Double-click on any task to edit
3. **Complete Task**: Click the status button to update progress
4. **Delete Task**: Use the delete button with confirmation

### Voice Commands
- **Navigation**: "mở lịch", "mở analytics", "mở tasks", "mở email"
- **Task Creation**: Speak naturally, e.g., "Tạo task học toán vào ngày mai"
- **AI Chat**: Any non-navigation speech triggers AI conversation

### Calendar Features
- **View Tasks**: Click on dates to see task details
- **Create Recurring**: Select multiple dates and set recurrence
- **Navigate**: Use arrow buttons to change months

### Analytics
- **Filter Data**: Use date range selectors
- **Chart Types**: Switch between bar, pie, and line charts
- **Real-time Updates**: Charts update as you modify tasks

## 🔧 Configuration

### AI Integration Setup
```typescript
// In AnalyticsPage.tsx and App.tsx
const API_KEY = 'your-gemini-api-key'; // Replace with actual key
const genAI = new GoogleGenerativeAI(API_KEY);
```

### Email Service Setup
```typescript
// In EmailSchedulePage.tsx
const SERVICE_ID = "your-emailjs-service-id";
const TEMPLATE_ID = "your-emailjs-template-id";
const PUBLIC_KEY = "your-emailjs-public-key";
```

## 🧠 Future Enhancements

### Backend Integration
- **Node.js/Express** server for data synchronization
- **MongoDB** for scalable data storage
- **User authentication** and multi-user support
- **Real-time collaboration** features

### Mobile App
- **React Native** implementation
- **Push notifications** for task reminders
- **Offline synchronization** capabilities

### Advanced AI Features
- **Personalized scheduling** based on user patterns
- **Smart task categorization** using machine learning
- **Voice emotion analysis** for priority adjustment
- **Natural language task parsing** improvements

### Additional Features
- **Team collaboration** with shared workspaces
- **Advanced analytics** with predictive insights
- **Integration APIs** for calendar services (Google Calendar, Outlook)
- **Gamification system** with achievements and rewards

## 📝 Development Notes

### Code Quality
- **TypeScript** for type safety and better developer experience
- **ESLint** configuration for consistent code style
- **Modular architecture** with separated concerns
- **Responsive design** for mobile and desktop

### Performance Optimizations
- **Lazy loading** for route components
- **Memoization** for expensive calculations
- **Efficient re-renders** using React hooks
- **LocalStorage optimization** for data persistence

### Browser Support
- **Modern browsers** with ES6+ support
- **Microphone API** for voice recognition
- **LocalStorage** for data persistence
- **Responsive design** for various screen sizes

## ✅ Checklist
- [x] Code runs without errors
- [x] All required features implemented
- [x] Voice recognition with AI integration
- [x] Calendar view with recurrence support
- [x] Analytics dashboard with interactive charts
- [x] Email scheduling functionality
- [x] Responsive design for mobile and desktop
- [x] TypeScript implementation for type safety
- [x] LocalStorage for data persistence
- [x] Comprehensive documentation

## 📄 License
This project is developed for the Naver Vietnam AI Hackathon 2024.

## 👥 Contributors
- PDN237 - Main Developer

---

*Built with ❤️ using React, TypeScript, and AI-powered features for the Naver Vietnam AI Hackathon 2024*
