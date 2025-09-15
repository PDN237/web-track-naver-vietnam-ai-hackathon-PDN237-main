import React, { useEffect, useState, useCallback } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { BarChart2, CheckSquare, Calendar as CalendarIcon, Mail, Mic } from "lucide-react";
import { getAllTasks } from "./db";
import "./AnalyticsPage.css";
import type { Task } from "./db";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const AnalyticsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");

  // Speech recognition
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | '' }>({ message: '', type: '' });

  // Function to show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 5000);
  }, []);

  useEffect(() => {
    getAllTasks().then(setTasks);
  }, []);

  // Check browser support for speech recognition
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      showNotification('Trình duyệt không hỗ trợ nhận dạng giọng nói.', 'error');
    }
  }, [browserSupportsSpeechRecognition, showNotification]);

  // Handle voice input when listening stops
  useEffect(() => {
    if (!listening && transcript) {
      handleVoiceInput(transcript);
      resetTranscript();
    }
  }, [listening, transcript]);

  // Function to handle voice input with Gemini API
  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) {
      showNotification('Không có nội dung giọng nói.', 'warning');
      return;
    }

    const lowerTranscript = transcript.toLowerCase();

    // Check for navigation commands
    if (lowerTranscript.includes('mở lịch') || lowerTranscript.includes('open calendar')) {
      navigate('/calendar');
      showNotification('Đã mở trang Lịch!', 'success');
      return;
    }

    if (lowerTranscript.includes('mở analytics') || lowerTranscript.includes('open analytics') || lowerTranscript.includes('mở bảng thống kê') || lowerTranscript.includes('thống kê')) {
      navigate('/analytics');
      showNotification('Đã mở trang Analytics!', 'success');
      return;
    }

    if (lowerTranscript.includes('mở email') || lowerTranscript.includes('open email') || lowerTranscript.includes('mở lịch email') || lowerTranscript.includes('tự động') || lowerTranscript.includes('gửi lịch hôm nay')) {
      navigate('/email');
      showNotification('Đã mở trang Email Schedule!', 'success');
      return;
    }

    if (lowerTranscript.includes('mở voice history') || lowerTranscript.includes('open voice history') || lowerTranscript.includes('lịch sử giọng nói')) {
      navigate('/voice-history');
      showNotification('Đã mở trang Lịch sử Giọng nói!', 'success');
      return;
    }

    if (lowerTranscript.includes('mở tasks') || lowerTranscript.includes('open tasks') || lowerTranscript.includes('mở công việc') || lowerTranscript.includes('mở task') || lowerTranscript.includes('mở thời khóa biểu')) {
      navigate('/');
      showNotification('Đã mở trang Tasks!', 'success');
      return;
    }

    // If not a navigation command, treat as chat
    try {
      const API_KEY = 'AIzaSyDqQZi_lYtwXo7p_WBkI1vXkI_txL_dc8s'; // Thay thế bằng API key thực tế của bạn từ Google AI Studio
      if (!API_KEY) {
        showNotification('API key cho AI chưa được cấu hình.', 'error');
        return;
      }
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Bạn là trợ lý AI hữu ích và thân thiện. Trả lời tin nhắn của người dùng một cách ngắn gọn, hữu ích và bằng tiếng Việt. Tin nhắn: "${transcript}"`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = await response.text();

      // Show the response in notification
      showNotification(text, 'success');
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      let errorMessage = 'Lỗi khi trò chuyện với AI. Vui lòng thử lại.';
      if (error.message) {
        if (error.message.includes('429')) {
          errorMessage = 'Bạn đã vượt quá hạn mức sử dụng API AI. Vui lòng kiểm tra lại kế hoạch và chi tiết thanh toán của bạn.';
        } else {
          errorMessage += ` Chi tiết: ${error.message}`;
        }
      }
      showNotification(errorMessage, 'error');
    }
  };

  // Filter tasks by selected date range
  const filteredTasks = tasks.filter((task) => {
    if (!startDate && !endDate) return true;
    const due = new Date(task.dueDate);
    if (startDate && due < new Date(startDate)) return false;
    if (endDate && due > new Date(endDate)) return false;
    return true;
  });

  // Compute task status distribution
  const statusCounts = filteredTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Compute priority distribution
  const priorityCounts = filteredTasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Compute category distribution
  const categoryCounts = filteredTasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Summary counts
  const totalTasks = filteredTasks.length;

  // Prepare data for charts
  const statusData = {
    labels: ["To Do", "In Progress", "Done", "Overdue"],
    datasets: [
      {
        label: "Tasks by Status",
        data: [
          statusCounts["todo"] || 0,
          statusCounts["in-progress"] || 0,
          statusCounts["done"] || 0,
          statusCounts["overdue"] || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // blue
          "rgba(234, 179, 8, 0.8)", // yellow
          "rgba(16, 185, 129, 0.8)", // green
          "rgba(239, 68, 68, 0.8)", // red
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        label: "Tasks by Priority",
        data: [
          priorityCounts["high"] || 0,
          priorityCounts["medium"] || 0,
          priorityCounts["low"] || 0,
        ],
        backgroundColor: [
          "rgba(220, 38, 38, 0.8)", // red
          "rgba(202, 138, 4, 0.8)", // amber
          "rgba(34, 197, 94, 0.8)", // green
        ],
        borderColor: [
          "rgba(220, 38, 38, 1)",
          "rgba(202, 138, 4, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: ["Study", "Work", "Personal"],
    datasets: [
      {
        label: "Tasks by Category",
        data: [
          categoryCounts["study"] || 0,
          categoryCounts["work"] || 0,
          categoryCounts["personal"] || 0,
        ],
        backgroundColor: [
          "rgba(14, 165, 233, 0.8)", // blue
          "rgba(124, 58, 237, 0.8)", // purple
          "rgba(236, 72, 153, 0.8)", // pink
        ],
        borderColor: [
          "rgba(14, 165, 233, 1)",
          "rgba(124, 58, 237, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: "nearest" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 14,
          },
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // Function to render chart based on selected type
  const renderChart = (data: any, options: any) => {
    switch (chartType) {
      case "pie":
        return <Pie data={data} options={options} />;
      case "line":
        return <Line data={data} options={options} />;
      case "bar":
      default:
        return <Bar data={data} options={options} />;
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">StudyNote</div>
        <nav className="nav">
          <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
            <CheckSquare /> Tasks
          </Link>
          <Link to="/calendar" className={`nav-item ${location.pathname === "/calendar" ? "active" : ""}`}>
            <CalendarIcon /> Calendar
          </Link>
          <Link to="/analytics" className={`nav-item ${location.pathname === "/analytics" ? "active" : ""}`}>
            <BarChart2 /> Analytics
          </Link>
          <Link to="/email" className={`nav-item ${location.pathname === "/email" ? "active" : ""}`}>
            <Mail /> Email Schedule
          </Link>
        </nav>
      </aside>

      <main className="main analytics-main">
        {notification.message && (
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              padding: '10px 20px',
              borderRadius: 5,
              color: 'white',
              backgroundColor: notification.type === 'success' ? '#4CAF50' : notification.type === 'error' ? '#f44336' : '#ff9800',
              zIndex: 1000,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            {notification.message}
          </div>
        )}
        <header className="topbar">
          <h1 className="page-title">Task Analytics</h1>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={() => {
                  if (listening) {
                    SpeechRecognition.stopListening();
                  } else {
                    SpeechRecognition.startListening({ continuous: false, language: 'vi-VN' });
                  }
                }}
                style={{
                  padding: 10,
                  borderRadius: 50,
                  border: 'none',
                  backgroundColor: listening ? '#ff4444' : '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
                title={listening ? 'Dừng nghe' : 'Bắt đầu nghe'}
              >
                <Mic />
              </button>
              {listening && <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Đang nghe...</span>}
              {transcript && !listening && <span style={{ color: '#666' }}>Bạn nói: "{transcript}"</span>}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label htmlFor="startDate" style={{ fontWeight: 600 }}>
                Start Date:
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <label htmlFor="endDate" style={{ fontWeight: 600 }}>
                End Date:
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label htmlFor="chartTypeSelect" style={{ fontWeight: 600 }}>
                Chart Type:
              </label>
              <select
                id="chartTypeSelect"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as "bar" | "pie" | "line")}
                style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
              >
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="line">Line Chart</option>
              </select>
            </div>
          </div>
        </header>

        <section className="filter-container">
          <label>
            Start Date:{" "}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:{" "}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </section>

        <section className="summary-container">
          <h2>Summary</h2>
          <p>Total Tasks: {totalTasks}</p>
          <p>To Do: {statusCounts["todo"] || 0}</p>
          <p>In Progress: {statusCounts["in-progress"] || 0}</p>
          <p>Done: {statusCounts["done"] || 0}</p>
          <p>Overdue: {statusCounts["overdue"] || 0}</p>
        </section>

        <section className="charts-container">
          <div className="chart-card">
            <h2>Status Distribution</h2>
            {renderChart(statusData, commonOptions)}
            <div className="legend">
              <span className="legend-item" style={{ backgroundColor: "rgba(59, 130, 246, 0.8)" }}>To Do</span>
              <span className="legend-item" style={{ backgroundColor: "rgba(234, 179, 8, 0.8)" }}>In Progress</span>
              <span className="legend-item" style={{ backgroundColor: "rgba(16, 185, 129, 0.8)" }}>Done</span>
              <span className="legend-item" style={{ backgroundColor: "rgba(239, 68, 68, 0.8)" }}>Overdue</span>
            </div>
          </div>

          <div className="chart-card">
            <h2>Priority Distribution</h2>
            {renderChart(priorityData, commonOptions)}
            <div className="legend">
              <span className="legend-item" style={{ backgroundColor: "rgba(220, 38, 38, 0.8)" }}>High</span>
              <span className="legend-item" style={{ backgroundColor: "rgba(202, 138, 4, 0.8)" }}>Medium</span>
              <span className="legend-item" style={{ backgroundColor: "rgba(34, 197, 94, 0.8)" }}>Low</span>
            </div>
          </div>

          <div className="chart-card">
            <h2>Category Distribution</h2>
            {renderChart(categoryData, commonOptions)}
            <div className="legend">
              <span className="legend-item" style={{ backgroundColor: "rgba(14, 165, 233, 0.8)" }}>Study</span>
              <span className="legend-item" style={{ backgroundColor: "rgba(124, 58, 237, 0.8)" }}>Work</span>
              <span className="legend-item" style={{ backgroundColor: "rgba(236, 72, 153, 0.8)" }}>Personal</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AnalyticsPage;
