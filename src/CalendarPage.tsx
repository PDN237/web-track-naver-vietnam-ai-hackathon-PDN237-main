import { useState, useEffect, useMemo } from "react";
import { Calendar, CheckSquare, BarChart2, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { getAllTasks, createRecurringTasks } from "./db";
import type { Task, Recurrence } from "./db";
import "./CalendarPage.css";
import { Link, useLocation } from "react-router-dom";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<Recurrence["frequency"]>("weekly");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");

  const location = useLocation();

  useEffect(() => {
    getAllTasks().then((list) => setTasks(list));
  }, []);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const dueDate = new Date(task.dueDate);
      // Normalize date to midnight to avoid timezone issues
      const dateKey = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(task);
    });
    return grouped;
  }, [tasks]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const getTasksForDate = (date: Date) => {
    // Normalize date to midnight to match grouping keys
    const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
    return tasksByDate[dateKey] || [];
  };

  // Toggle selection of a date in multi-select mode
  const toggleDateSelection = (date: Date) => {
    setSelectedDates(prev => {
      const exists = prev.find(d => d.toDateString() === date.toDateString());
      if (exists) {
        return prev.filter(d => d.toDateString() !== date.toDateString());
      } else {
        return [...prev, date];
      }
    });
  };

  // Check if a date is selected in multi-select mode
  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
  };

  // Handle day click depending on mode
  const handleDayClick = (date: Date) => {
    if (selectionMode) {
      toggleDateSelection(date);
    } else {
      setSelectedDate(date);
      setShowModal(true);
    }
  };

  // Open recurrence modal
  const openRecurrenceModal = () => {
    if (selectedDates.length === 0) return;
    setRecurrenceFrequency("weekly");
    setRecurrenceInterval(1);
    setRecurrenceEndDate("");
    setShowRecurrenceModal(true);
  };

  // Confirm recurrence creation
  const confirmRecurrence = async () => {
    // For each selected date, get tasks and create recurring tasks
    for (const date of selectedDates) {
      const tasksForDate = getTasksForDate(date);
      for (const task of tasksForDate) {
        if (!task.recurrence) {
          // Preserve the original time from the task
          const originalDate = new Date(task.dueDate);
          const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          selectedDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds(), originalDate.getMilliseconds());

          // Create recurring tasks based on user input
          const baseTask = {
            ...task,
            dueDate: selectedDate.toISOString(),
            recurrence: {
              frequency: recurrenceFrequency,
              interval: recurrenceInterval,
              endDate: recurrenceEndDate || undefined,
            },
          };
          await createRecurringTasks(baseTask);
        }
      }
    }
    // Refresh tasks
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
    // Clear selection and close modal
    setSelectedDates([]);
    setShowRecurrenceModal(false);
    setSelectionMode(false);
  };

  // Cancel recurrence modal
  const cancelRecurrence = () => {
    setShowRecurrenceModal(false);
  };

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
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <h1 className="page-title">Lịch công việc</h1>
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={() => navigateMonth('prev')}>
              <ChevronLeft size={20} />
            </button>
            <select
              className="month-select"
              value={currentDate.getMonth()}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value, 10);
                setCurrentDate(prev => new Date(prev.getFullYear(), newMonth, 1));
              }}
            >
              {[...Array(12).keys()].map(m => (
                <option key={m} value={m}>
                  {new Date(0, m).toLocaleString('vi-VN', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              className="year-select"
              value={currentDate.getFullYear()}
              onChange={(e) => {
                const newYear = parseInt(e.target.value, 10);
                setCurrentDate(prev => new Date(newYear, prev.getMonth(), 1));
              }}
            >
              {Array.from({ length: 21 }, (_, i) => 2020 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button className="nav-btn" onClick={() => navigateMonth('next')}>
              <ChevronRight size={20} />
            </button>
            {/* Toggle selection mode button */}
            <button
              className={`nav-btn ${selectionMode ? "active" : ""}`}
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedDates([]);
              }}
              title="Chế độ chọn nhiều ngày"
              style={{ marginLeft: "12px" }}
            >
              {selectionMode ? "Hủy chọn nhiều ngày" : "Chọn nhiều ngày"}
            </button>
            {/* Button to open recurrence modal */}
            <button
              className="nav-btn"
              onClick={openRecurrenceModal}
              disabled={selectedDates.length === 0}
              title="Thiết lập lặp lại cho các ngày đã chọn"
              style={{ marginLeft: "8px" }}
            >
              Thiết lập lặp lại
            </button>
          </div>
        </header>

        <section className="calendar-container">
          <div className="calendar-header">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
              <div key={day} className="calendar-header-day">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDays.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDay = isToday(date);
              const selected = isDateSelected(date);

              return (
                <div
                  key={index}
                  className={`calendar-day ${!isCurrentMonthDay ? 'other-month' : ''} ${isTodayDay ? 'today' : ''} ${selected ? 'selected-day' : ''}`}
                  onClick={() => handleDayClick(date)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="day-number">{date.getDate()}</div>
                  <div className="day-tasks">
                    {dayTasks
                      .slice()
                      .sort((a, b) => {
                        // Prioritize tasks that are not done or overdue
                        const statusPriority = (task: any) => {
                          if (task.status === "done" || task.status === "overdue") return 1;
                          return 0;
                        };
                        const statusDiff = statusPriority(a) - statusPriority(b);
                        if (statusDiff !== 0) return statusDiff;

                        // Then sort by dueDate ascending
                        const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        if (dateDiff !== 0) return dateDiff;

                        // Then by priority: high < medium < low
                        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      })
                      .slice(0, 2)
                      .map(task => (
                        <div key={task.id} className={`task-item ${task.status} ${task.priority}`}>
                          <span className="task-title">{task.title}</span>
                          <div className="task-meta">
                            <span className={`badge pri ${task.priority}`}>{task.priority}</span>
                            <span className={`badge cat ${task.category}`}>{task.category}</span>
                          </div>
                        </div>
                      ))}
                    {dayTasks.length > 2 && (
                      <div className="more-tasks">+{dayTasks.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Existing modal for single day tasks */}
        {showModal && selectedDate && (
          <div className="modal" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Deadline cho ngày {selectedDate.toLocaleDateString('vi-VN')}</h2>
              <div className="note-list">
                {getTasksForDate(selectedDate)
                  .slice()
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map(task => (
                    <div key={task.id} className={`note-item ${task.status} ${task.priority}`}>
                      <h3>{task.title}</h3>
                      <p>{task.description || "Không có mô tả"}</p>
                      <div className="task-meta">
                        <div className={`badge pri ${task.priority}`}>
                          <strong>Priority:</strong> {task.priority} {task.priority === "high" ? "🔥" : task.priority === "medium" ? "⚡" : "🟢"}
                        </div>
                        <div className={`badge cat ${task.category}`}>
                          <strong>Category:</strong> {task.category === "study" ? "📚" : task.category === "work" ? "💼" : "🎉"} {task.category}
                        </div>
                        <div className={`badge status ${task.status}`}>
                          <strong>Status:</strong> {task.status === "todo" ? "To Do" : task.status === "in-progress" ? "In Progress" : task.status === "done" ? "Done" : "Overdue"}
                        </div>
                        <div className="due-time">
                          <strong>Due:</strong> 🕒 {new Date(task.dueDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                {getTasksForDate(selectedDate).length === 0 && <p>Không có deadline nào cho ngày này.</p>}
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        )}

        {/* New modal for recurrence options */}
        {showRecurrenceModal && (
          <div className="modal" onClick={cancelRecurrence}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Thiết lập lặp lại cho các ngày đã chọn</h2>
              <form onSubmit={e => { e.preventDefault(); confirmRecurrence(); }}>
                <label>
                  Tần suất lặp lại:
                  <select
                    value={recurrenceFrequency}
                    onChange={e => setRecurrenceFrequency(e.target.value as Recurrence["frequency"])}
                  >
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </label>
                <label>
                  Khoảng cách (số lần lặp):
                  <input
                    type="number"
                    min={1}
                    value={recurrenceInterval}
                    onChange={e => setRecurrenceInterval(parseInt(e.target.value, 10) || 1)}
                  />
                </label>
                <label>
                  Ngày kết thúc (tùy chọn):
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={e => setRecurrenceEndDate(e.target.value)}
                  />
                </label>
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button type="button" className="btn" onClick={cancelRecurrence}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Xác nhận</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="empty">Chưa có công việc nào để hiển thị trên lịch.</div>
        )}
      </main>
    </div>
  );
}
