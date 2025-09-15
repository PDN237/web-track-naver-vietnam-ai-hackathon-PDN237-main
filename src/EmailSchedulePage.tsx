import React, { useState, useEffect } from "react";
import { Mail, Send, Save, Calendar, BarChart2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import { getAllTasks } from "./db";
import type { Task } from "./db";
import { Link, useLocation } from "react-router-dom";
import "./EmailSchedulePage.css";

// EmailJS configuration - Replace with your actual IDs
const SERVICE_ID = "service_h85sgmb";
const TEMPLATE_ID = "template_8th4zfg";
const PUBLIC_KEY = "BAYmYBi5MfnsT3KTb";

const EmailSchedulePage: React.FC = () => {
  const location = useLocation();
  const [savedEmail, setSavedEmail] = useState<string>("");
  const [toEmail, setToEmail] = useState<string>("");
  const [savedToEmail, setSavedToEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Load saved email from localStorage
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setSavedEmail(storedEmail);
    }
    // Load saved toEmail from localStorage
    const storedToEmail = localStorage.getItem("toEmail");
    if (storedToEmail) {
      setSavedToEmail(storedToEmail);
      setToEmail(storedToEmail);
    }
  }, []);

  // Function to get today's tasks
  const getTodaysTasks = async (): Promise<Task[]> => {
    const allTasks = await getAllTasks();
    const today = new Date();
    const todayStr = today.toDateString();
    return allTasks.filter(task => new Date(task.dueDate).toDateString() === todayStr);
  };

  // Function to format tasks into email content
  const formatTasksForEmail = (tasks: Task[]): string => {
    if (tasks.length === 0) {
      return `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #4CAF50;">🎉 Chúc mừng!</h2>
          <p style="font-size: 18px;">Hôm nay bạn không có công việc nào. Hãy nghỉ ngơi và chuẩn bị cho ngày mai!</p>
        </div>
      `;
    }

    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <h1 style="color: #333; text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">📅 Lịch Trình Hôm Nay</h1>
        <p style="font-size: 16px; text-align: center; color: #666;">${today}</p>
        <div style="margin-top: 20px;">
    `;

    tasks.forEach(task => {
      const priorityColor = task.priority === 'high' ? '#f44336' : task.priority === 'medium' ? '#ff9800' : '#4CAF50';
      const statusColor = task.status === 'done' ? '#9e9e9e' : task.status === 'in-progress' ? '#2196F3' : task.status === 'overdue' ? '#f44336' : '#4CAF50';
      const statusIcon = task.status === 'done' ? '✅' : task.status === 'in-progress' ? '🔄' : task.status === 'overdue' ? '⚠️' : '⏰';
      const categoryIcon = task.category === 'study' ? '📚' : task.category === 'work' ? '💼' : '🎉';

      content += `
        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 10px 0; color: ${priorityColor}; font-size: 18px;">${statusIcon} ${task.title}</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong>Thời gian:</strong> ${new Date(task.dueDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
          ${task.description ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Mô tả:</strong> ${task.description}</p>` : ''}
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <span style="background-color: ${priorityColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">Ưu tiên: ${task.priority}</span>
            <span style="background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">Trạng thái: ${task.status}</span>
            <span style="background-color: #9c27b0; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">${categoryIcon} ${task.category}</span>
          </div>
        </div>
      `;
    });

    content += `
        </div>
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">Chúc bạn một ngày học tập hiệu quả! 📖✨</p>
          <p style="color: #999; font-size: 12px;">Gửi từ StudyNote App</p>
        </div>
      </div>
    `;

    return content;
  };

  // Function to send email
  const sendEmail = async (subject: string, body: string) => {
    if (!savedEmail) {
      setMessage("Vui lòng nhập và lưu email trước.");
      return;
    }
    if (!savedToEmail) {
      setMessage("Vui lòng nhập và lưu email nhận trước.");
      return;
    }

    const templateParams = {
      to_email: savedToEmail,
      subject: subject,
      message: body,
      reply_to: savedEmail,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setMessage("Email đã được gửi thành công!");
    } catch (error) {
      console.error("Error sending email:", error);
      setMessage("Lỗi khi gửi email. Vui lòng kiểm tra cấu hình EmailJS.");
    }
  };



  // Handle save toEmail
  const handleSaveToEmail = () => {
    if (!toEmail.trim()) {
      setMessage("Vui lòng nhập email nhận hợp lệ.");
      return;
    }
    localStorage.setItem("toEmail", toEmail.trim());
    setSavedToEmail(toEmail.trim());
    setMessage("Email nhận đã được lưu thành công!");
  };

  // Handle send today's schedule
  const handleSendTodaysSchedule = async () => {
    setLoading(true);
    setMessage("");
    try {
      // Save toEmail before sending
      if (toEmail.trim() && toEmail.trim() !== savedToEmail) {
        localStorage.setItem("toEmail", toEmail.trim());
        setSavedToEmail(toEmail.trim());
      }
      const todaysTasks = await getTodaysTasks();
      const body = formatTasksForEmail(todaysTasks);
      await sendEmail("Lịch trình hôm nay", body);
    } catch (error) {
      setMessage("Lỗi khi gửi email.");
    } finally {
      setLoading(false);
    }
  };

  // Automatic daily sending
  useEffect(() => {
    if (!savedEmail) return;

    const checkAndSendDaily = async () => {
      const lastSent = localStorage.getItem("lastEmailSent");
      const today = new Date().toDateString();
      if (lastSent !== today) {
        // Send daily email
        const todaysTasks = await getTodaysTasks();
        const body = formatTasksForEmail(todaysTasks);
        await sendEmail("Lịch trình hôm nay", body);
        localStorage.setItem("lastEmailSent", today);
      }
    };

    // Check every hour (3600000 ms)
    const interval = setInterval(checkAndSendDaily, 3600000);

    // Initial check
    checkAndSendDaily();

    return () => clearInterval(interval);
  }, [savedEmail]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">StudyNote</div>
        <nav className="nav">
          <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
            <Mail /> Tasks
          </Link>
          <Link to="/calendar" className={`nav-item ${location.pathname === "/calendar" ? "active" : ""}`}>
            <Calendar /> Calendar
          </Link>
          <Link to="/analytics" className={`nav-item ${location.pathname === "/analytics" ? "active" : ""}`}>
            <BarChart2 /> Analytics
          </Link>
          <Link to="/email" className={`nav-item ${location.pathname === "/email" ? "active" : ""}`}>
            <Mail /> Email Schedule
          </Link>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1 className="page-title">Email Schedule</h1>
        </header>

        <section className="email-form">
          <h2>Thiết lập email để nhận lịch trình hàng ngày</h2>
         

          <div className="form-group" style={{ marginTop: "20px" }}>
            <label htmlFor="toEmail">Gửi đến email:</label>
            <input
              type="email"
              id="toEmail"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="Nhập email nhận"
            />
            <button onClick={handleSaveToEmail} className="btn btn-primary">
              <Save /> Lưu Email Nhận
            </button>
          </div>
          {savedToEmail && <p>Email nhận đã lưu: {savedToEmail}</p>}

          <button onClick={handleSendTodaysSchedule} className="btn btn-primary" disabled={loading}>
            <Send /> Gửi lịch hôm nay
          </button>

          {message && <p className="message">{message}</p>}

          
        </section>
      </main>
    </div>
  );
};

export default EmailSchedulePage;
