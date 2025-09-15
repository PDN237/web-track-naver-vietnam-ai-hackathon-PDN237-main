
import { useMemo, useState, useEffect, forwardRef, useCallback } from "react";
import {
  Calendar,
  CheckCircle2,
  Circle,
  BarChart2,
  PlusCircle,
  Search,
  Filter,
  Clock,
  Tag,
  CheckSquare,
  Hourglass, // Icon cho In Progress
  XCircle, // Icon cho Overdue
  Trash2, // Icon cho xóa
  Mail,
  Mic,
} from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';
import "./App.css";
import type { Task } from "./db";
import { getAllTasks, createTask, updateTask, deleteTask } from "./db"; // Import deleteTask
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useLocation, useNavigate } from "react-router-dom";


// custom input cho DatePicker có icon 📅
const CustomDateInput = forwardRef<HTMLInputElement, any>(({ value, onClick }, ref) => (
  <div className="input-with-icon" onClick={onClick}>
    <Calendar size={18} className="icon-calendar" />
    <input
      type="text"
      value={value}
      ref={ref}
      placeholder="Chọn ngày & giờ"
      className="datepicker-input"
    />
  </div>
));
CustomDateInput.displayName = "CustomDateInput";

type Status = "todo" | "in-progress" | "done" | "overdue";
type Priority = "low" | "medium" | "high";
type Category = "study" | "work" | "personal";

// Component mới để hiển thị bộ đếm ngược
interface CountdownProps {
  dueDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ dueDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(dueDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: React.ReactNode[] = []; // Đã sửa từ JSX.Element[] sang React.ReactNode[]

  Object.keys(timeLeft).forEach((interval) => {
    // @ts-ignore
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      // @ts-ignore
      <span key={interval}>
        {/* @ts-ignore */}
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });

  return (
    <>
      {timerComponents.length ? (
        timerComponents
      ) : (
        <span>Đã quá hạn!</span>
      )}
    </>
  );
};


export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "title">("dueDate");

  const [showAddForm, setShowAddForm] = useState(false); // Đổi tên để phân biệt với form edit
  const [editingTask, setEditingTask] = useState<Task | null>(null); // State cho task đang chỉnh sửa

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  // form state (dùng chung cho cả add và edit)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("study");

  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | '' }>({ message: '', type: '' });

  // Deadline suggestions
  const deadlineSuggestions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return [
      {
        label: "Hôm nay 17:00",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
      },
      {
        label: "Ngày mai 9:00",
        date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
      },
      {
        label: "Tuần sau",
        date: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 9, 0),
      },
      {
        label: "Cuối tuần này",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()), 18, 0),
      },
    ];
  }, []);

  // Load tasks
  useEffect(() => {
    getAllTasks().then((list) => setTasks(list));
  }, []);

  // Function to show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 5000); // Thông báo sẽ biến mất sau 5 giây
  }, []);

  // Speech recognition
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

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

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.description ?? "").toLowerCase().includes(s)
      );
    }
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter((t) => t.category === categoryFilter);

    // Sort tasks with logic:
    // 1. Tasks with status "todo" or "in-progress" come first (not done or overdue)
    // 2. Then sort by dueDate ascending
    // 3. Then by priority: high < medium < low
    // 4. Then by title alphabetically
    list.sort((a, b) => {
      const statusPriority = (task: Task) => {
        if (task.status === "done") return 1;
        if (task.status === "overdue") return 2;
        return 0;
      };
      const statusDiff = statusPriority(a) - statusPriority(b);
      if (statusDiff !== 0) return statusDiff;

      const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dateDiff !== 0) return dateDiff;

      const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return a.title.localeCompare(b.title);
    });

    return list;
  }, [tasks, q, statusFilter, categoryFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

  const doneCount = tasks.filter((t) => t.status === "done").length;

  // Hàm reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(null);
    setPriority("medium");
    setCategory("study");
    setEditingTask(null); // Đảm bảo reset cả editingTask
  };

  // Hàm đóng form (add hoặc edit)
  const closeForm = () => {
    setShowAddForm(false);
    setEditingTask(null);
    resetForm();
  };

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();

    // Logic 1: Kiểm tra tiêu đề và ngày đến hạn không được rỗng
    if (!title.trim() || !dueDate) {
      showNotification('Lỗi: Vui lòng nhập tiêu đề và chọn ngày đến hạn.', 'error');
      return;
    }

    // Logic 2: Kiểm tra ngày đến hạn không được ở trong quá khứ
    if (dueDate.getTime() < new Date().getTime()) {
      showNotification('Lỗi: Ngày đến hạn không thể ở trong quá khứ.', 'error');
      return;
    }

    // Logic 3: Kiểm tra trùng lặp task (cùng tiêu đề và cùng ngày đến hạn)
    const isDuplicate = tasks.some(
      (t) =>
        t.title.toLowerCase() === title.trim().toLowerCase() &&
        new Date(t.dueDate).toDateString() === dueDate.toDateString()
    );
    if (isDuplicate) {
      showNotification('Lỗi: Task đã tồn tại với cùng tiêu đề và ngày đến hạn.', 'error');
      return;
    }

    const newTask = await createTask({
      title,
      description,
      dueDate: dueDate.toISOString(),
      status: "todo",
      priority,
      category,
    });

    setTasks((prev) => [...prev, newTask]);
    resetForm();
    setShowAddForm(false);
    showNotification('Task đã được thêm thành công!', 'success');
  }

  // Hàm xử lý chỉnh sửa task
  async function handleEditTask(e: React.FormEvent) {
    e.preventDefault();

    if (!editingTask) return; // Đảm bảo có task đang chỉnh sửa

    if (editingTask.status === "overdue") {
      showNotification('Không thể chỉnh sửa task đã quá hạn.', 'error');
      return;
    }

    // Logic 1: Kiểm tra tiêu đề và ngày đến hạn không được rỗng
    if (!title.trim() || !dueDate) {
      showNotification('Lỗi: Vui lòng nhập tiêu đề và chọn ngày đến hạn.', 'error');
      return;
    }

    // Logic 2: Kiểm tra ngày đến hạn không được ở trong quá khứ
    if (dueDate.getTime() < new Date().getTime() && editingTask.status !== "done") {
      // Cho phép chỉnh sửa ngày quá khứ nếu task đã hoàn thành
      showNotification('Lỗi: Ngày đến hạn không thể ở trong quá khứ cho task chưa hoàn thành.', 'error');
      return;
    }

    // Logic 3: Kiểm tra trùng lặp task (cùng tiêu đề và cùng ngày đến hạn, trừ chính nó)
    const isDuplicate = tasks.some(
      (t) =>
        t.id !== editingTask.id && // Bỏ qua chính task đang chỉnh sửa
        t.title.toLowerCase() === title.trim().toLowerCase() &&
        new Date(t.dueDate).toDateString() === dueDate.toDateString()
    );
    if (isDuplicate) {
      showNotification('Lỗi: Task đã tồn tại với cùng tiêu đề và ngày đến hạn.', 'error');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn cập nhật task "${editingTask.title}" không?`)) {
      const updatedTask = {
        ...editingTask,
        title,
        description,
        dueDate: dueDate.toISOString(),
        priority,
        category,
      };

      const result = await updateTask(updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === result.id ? result : t)));
      resetForm();
      closeForm();
      showNotification('Task đã được cập nhật thành công!', 'success');
    }
  }

  // Hàm xử lý xóa task
  const handleDeleteTask = useCallback(async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa task "${taskTitle}" không? Hành động này không thể hoàn tác.`)) {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      closeForm(); // Đóng form nếu đang mở task bị xóa
      showNotification(`Task "${taskTitle}" đã được xóa thành công!`, 'success');
    }
  }, [showNotification]);

  // Hàm cập nhật trạng thái task
  const handleUpdateTaskStatus = useCallback(async (taskId: string, newStatus: Status) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      if (window.confirm(`Bạn có chắc chắn muốn cập nhật trạng thái task "${taskToUpdate.title}" thành "${newStatus}" không?`)) {
        const updated = await updateTask({ ...taskToUpdate, status: newStatus });
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        showNotification(`Trạng thái task "${updated.title}" đã được cập nhật thành "${newStatus}".`, 'success');
      }
    }
  }, [tasks, showNotification]);

  // Logic nhắc nhở và tự động cập nhật trạng thái
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let shouldUpdateTasks = false;
      let notificationsToSend: { message: string; type: 'success' | 'error' | 'warning' }[] = [];
      let tasksToUpdateInDB: Task[] = []; // Danh sách các task cần lưu vào DB

      const updatedTasks = tasks.map(task => {
        const originalStatus = task.status; // Lưu trạng thái gốc để so sánh
        let currentTask = { ...task }; // Tạo bản sao để chỉnh sửa

        const dueDate = new Date(currentTask.dueDate);
        const timeLeft = dueDate.getTime() - now.getTime(); // Thời gian còn lại (ms)
        const timeLeftDays = Math.ceil(timeLeft / (1000 * 60 * 60 * 24)); // Thời gian còn lại (ngày)
        const timeLeftHours = Math.ceil(timeLeft / (1000 * 60 * 60)); // Thời gian còn lại (giờ)

        // Logic 1: Chuyển trạng thái sang Overdue nếu quá hạn và chưa Done
        if (currentTask.status !== "done" && timeLeft < 0 && currentTask.status !== "overdue") {
          notificationsToSend.push({ message: `Task "${currentTask.title}" đã quá hạn và chưa hoàn thành!`, type: 'error' });
          currentTask.status = "overdue";
        }

        // Logic 2: Nhắc nhở chuyển To Do -> In Progress
        if (currentTask.status === "todo") {
          if (timeLeftDays === 7) {
            notificationsToSend.push({ message: `Task "${currentTask.title}" còn 7 ngày đến hạn. Hãy bắt đầu thực hiện!`, type: 'warning' });
          } else if (timeLeftDays === 5) {
            notificationsToSend.push({ message: `Task "${currentTask.title}" còn 5 ngày đến hạn. Đã đến lúc bắt đầu!`, type: 'warning' });
          } else if (timeLeftDays === 3) {
            notificationsToSend.push({ message: `Task "${currentTask.title}" còn 3 ngày đến hạn. Hãy chuyển sang "In Progress"!`, type: 'warning' });
          }
        }

        // Logic 3: Nhắc nhở hoàn thành task khi còn 1 giờ
        if (currentTask.status !== "done" && currentTask.status !== "overdue" && timeLeftHours === 1) {
          const confirmDone = window.confirm(`Task "${currentTask.title}" còn 1 giờ đến hạn. Bạn đã hoàn thành chưa? Nhấn OK nếu đã xong, Hủy nếu vẫn đang làm.`);
          if (confirmDone) {
            currentTask.status = "done";
          } else {
            // Nếu chưa xong, đảm bảo nó là in-progress hoặc todo (nếu người dùng chưa chuyển)
            if (currentTask.status === "todo") {
                currentTask.status = "in-progress";
            }
          }
        }
        // Nếu trạng thái thay đổi, đánh dấu để cập nhật và thêm vào danh sách cần lưu
        if (currentTask.status !== originalStatus) {
          shouldUpdateTasks = true;
          tasksToUpdateInDB.push(currentTask);
        }
        return currentTask;
      });

      if (shouldUpdateTasks) {
        // Cập nhật lại toàn bộ danh sách tasks nếu có thay đổi
        setTasks(updatedTasks);
        // Lưu các task đã thay đổi trạng thái vào LocalStorage
        tasksToUpdateInDB.forEach(async t => {
          await updateTask(t); // Gọi updateTask để lưu vào LocalStorage
        });
      }
      // Hiển thị tất cả thông báo đã thu thập
      notificationsToSend.forEach(notif => showNotification(notif.message, notif.type));

    }, 60 * 1000); // Kiểm tra mỗi phút

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, [tasks, showNotification]); // Dependency array: chạy lại khi tasks thay đổi

  // Hàm mở form chỉnh sửa khi double click vào task
  const handleDoubleClickTask = useCallback((task: Task) => {
    if (task.status === "overdue") {
      showNotification('Không thể chỉnh sửa task đã quá hạn.', 'error');
      return;
    }
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setDueDate(new Date(task.dueDate));
    setPriority(task.priority);
    setCategory(task.category);
  }, [showNotification]);


  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">StudyNote</div>
          <nav className="nav">
  <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
    <CheckSquare /> Tasks
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
        <div className="sidebar-footer">
          <button className="btn btn-primary" onClick={() => { setShowAddForm(true); resetForm(); }}>
            <PlusCircle /> Add Task
          </button>
          {/* Nút bật/tắt ghi âm giọng nói */}
          <button
            className={`btn ${listening ? 'btn-primary' : ''}`}
            onClick={() => {
              if (listening) {
                SpeechRecognition.stopListening();
              } else {
                resetTranscript();
                SpeechRecognition.startListening({ continuous: true, language: 'vi-VN' });
              }
            }}
            title={listening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
            style={{ marginTop: '10px', width: '100%' }}
          >
            <Mic size={18} /> {listening ? 'Đang ghi âm...' : 'Ghi âm giọng nói'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <h1 className="page-title">My Tasks</h1>

          <div className="actions">
            <div className="search">
              <Search size={18} />
              <input
                placeholder="Tìm nhanh: bài tập, môn học, mô tả…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="filters">
              <div className="select">
                <Filter size={16} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                  <option value="all">All status</option>
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="select">
                <Tag size={16} />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}>
                  <option value="all">All categories</option>
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div className="select">
                <span className="select-label">Sort</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                  <option value="dueDate">Deadline</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title (A→Z)</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        <section className="info-strip">
          <div>
            <strong>{tasks.length}</strong> tasks • <strong>{doneCount}</strong> done
          </div>
          <div className="hint">Tip: gõ để tìm nhanh, lọc theo trạng thái hoặc chuyên mục.</div>
        </section>

        <section className="list">

        {/* Pagination controls at top */}
      

          {paginatedTasks.map((t) => (
            <article key={t.id} className={`card ${t.status}`} onDoubleClick={() => handleDoubleClickTask(t)}>
              <div className="left">
                {t.status === "done" ? (
                  <CheckCircle2 className="icon-done" />
                ) : t.status === "in-progress" ? (
                  <Hourglass className="icon-in-progress" />
                ) : t.status === "overdue" ? (
                  <XCircle className="icon-overdue" />
                ) : (
                  <Circle className="icon-todo" />
                )}
              </div>

              <div className="content">
                <h3 className="title">{t.title}</h3>
                {t.description && (
                  <p className="desc" title={t.description}>
                    {t.description}
                  </p>
                )}
                <div className="meta">
                  <span className={`badge pri ${t.priority}`}>{t.priority}</span>
                  <span className={`badge cat ${t.category}`}>{t.category}</span>
                </div>
              </div>

              <div className="right">
                <div className={`due ${t.status}`}>
                  <Clock size={16} />
                  <span>
                    <Countdown dueDate={t.dueDate} />
                  </span>
                </div>
                <div className="status-buttons">
                  <button
                    className={`status-btn todo ${t.status === 'todo' ? 'active' : ''}`}
                    onClick={() => handleUpdateTaskStatus(t.id, 'todo')}
                    disabled={t.status === 'overdue'}
                  >
                    To Do
                  </button>
                  <button
                    className={`status-btn in-progress ${t.status === 'in-progress' ? 'active' : ''}`}
                    onClick={() => handleUpdateTaskStatus(t.id, 'in-progress')}
                    disabled={t.status === 'overdue'}
                  >
                    In Progress
                  </button>
                  <button
                    className={`status-btn done ${t.status === 'done' ? 'active' : ''}`}
                    onClick={() => handleUpdateTaskStatus(t.id, 'done')}
                    disabled={t.status === 'overdue'}
                  >
                    Done
                  </button>
                  <button
                    className="status-btn delete-btn" // Thêm class cho nút xóa
                    onClick={() => handleDeleteTask(t.id, t.title)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {paginatedTasks.length === 0 && <div className="empty">Không có task phù hợp bộ lọc hiện tại.</div>}

          {/* Pagination controls at bottom */}
          {filteredTasks.length > 0 && (
            <div className="pagination-controls">
              <button
                className="btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                className="btn"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="modal">
            <div className="modal-content big">
              <h2>Thêm công việc mới</h2>
              <form onSubmit={handleAddTask} className="task-form">
                <label>
                  Tiêu đề
                  <input
                    type="text"
                    placeholder="Ví dụ: Ôn tập Toán Chương 3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Mô tả
                  <textarea
                    placeholder="Ghi chú chi tiết, ví dụ: Làm hết bài tập từ 1 đến 10"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>

                <label>
                  Deadline (ngày & giờ)
                <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="dd/MM/yyyy HH:mm"
                customInput={<CustomDateInput />}
              />
              <div className="deadline-suggestions">
                {deadlineSuggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion.label}
                    className="btn btn-primary"
                    style={{ marginRight: 8, marginTop: 8 }}
                    onClick={() => setDueDate(suggestion.date)}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
                </label>

                <label>
                  Mức độ ưu tiên
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </label>

                <label>
                  Loại công việc
                  <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                    <option value="study">Học tập</option>
                    <option value="work">Công việc</option>
                    <option value="personal">Cá nhân</option>
                  </select>
                </label>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">💾 Lưu</button>
                  <button type="button" className="btn" onClick={closeForm}>❌ Hủy</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Task Form */}
        {editingTask && (
          <div className="modal">
            <div className="modal-content big">
              <h2>Chỉnh sửa công việc</h2>
              <form onSubmit={handleEditTask} className="task-form">
                <label>
                  Tiêu đề
                  <input
                    type="text"
                    placeholder="Ví dụ: Ôn tập Toán Chương 3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Mô tả
                  <textarea
                    placeholder="Ghi chú chi tiết, ví dụ: Làm hết bài tập từ 1 đến 10"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>

                <label>
                  Deadline (ngày & giờ)
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="dd/MM/yyyy HH:mm"
                  customInput={<CustomDateInput />}
                />
                <div className="deadline-suggestions">
                  {deadlineSuggestions.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion.label}
                      className="btn btn-primary"
                      style={{ marginRight: 8, marginTop: 8 }}
                      onClick={() => setDueDate(suggestion.date)}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
                </label>

                <label>
                  Mức độ ưu tiên
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </label>

                <label>
                  Loại công việc
                  <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                    <option value="study">Học tập</option>
                    <option value="work">Công việc</option>
                    <option value="personal">Cá nhân</option>
                  </select>
                </label>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">✅ Cập nhật</button>
                  <button type="button" className="btn" onClick={() => handleDeleteTask(editingTask.id, editingTask.title)}>
                    <Trash2 size={16} /> Xóa Task
                  </button>
                  <button type="button" className="btn" onClick={closeForm}>❌ Hủy</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notification Component */}
        {notification.message && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </main>
    </div>
  );
}
