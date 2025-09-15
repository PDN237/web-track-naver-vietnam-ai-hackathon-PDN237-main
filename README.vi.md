[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)
# StudyNote – Ứng dụng Quản lý Công việc AI

Một ứng dụng quản lý công việc hiện đại và thông minh dành cho sinh viên Việt Nam, tích hợp nhận dạng giọng nói, tạo công việc bằng AI, lịch công việc và gửi email tự động.

## 🚀 Thiết lập Dự án & Cách Sử dụng

### Yêu cầu Hệ thống
- Node.js (phiên bản 16 trở lên)
- Trình quản lý gói npm hoặc yarn
- Trình duyệt web hiện đại hỗ trợ microphone

### Cài đặt & Chạy
```bash
# Sao chép repository
git clone <repository-url>
cd web-track-naver-vietnam-ai-hackathon-PDN237-main

# Cài đặt dependencies
npm install

# Khởi động server phát triển
npm run dev

# Build cho production
npm run build
```

Ứng dụng sẽ có sẵn tại `http://localhost:5173`

## 🔗 Demo Trực tiếp
[Triển khai trên Vercel](https://web-track-naver-vietnam-ai-hackathon-pdn237-main.vercel.app/)

## 🎥 Video Demo
[Link Video Demo](https://youtu.be/yEZrtL_u3OE) 

## 💻 Tổng quan Dự án

### Tính năng Chính

#### 📝 Quản lý Công việc (CRUD)
- **Tạo Công việc**: Thêm công việc mới với tiêu đề, mô tả, ngày đến hạn, ưu tiên và danh mục
- **Xem Công việc**: Xem tất cả công việc với khả năng lọc và tìm kiếm
- **Cập nhật Công việc**: Chỉnh sửa công việc hiện có (nhấp đúp để chỉnh sửa)
- **Xóa Công việc**: Xóa công việc với hộp thoại xác nhận
- **Quản lý Trạng thái**: Cập nhật trạng thái công việc (Todo → In Progress → Done)

#### 🎤 Nhận dạng Giọng nói & Tích hợp AI
- **Lệnh Giọng nói**: Điều hướng giữa các trang bằng lệnh giọng nói
  - "mở lịch" → Mở Lịch
  - "mở analytics" → Mở Phân tích
  - "mở tasks" → Mở trang Công việc
  - "mở email" → Mở Lịch Email
- **Tạo Công việc bằng AI**: Sử dụng ngôn ngữ tự nhiên để tạo công việc qua giọng nói
- **Tích hợp Gemini AI**: Được hỗ trợ bởi Google Generative AI để xử lý giọng nói thông minh

#### 📅 Chế độ xem Lịch
- **Lịch Tháng**: Biểu diễn trực quan công việc theo ngày
- **Công việc Lặp lại**: Hỗ trợ lặp lại hàng ngày, hàng tuần và hàng tháng
- **Chọn Nhiều Ngày**: Chọn nhiều ngày để tạo công việc lặp lại
- **Modal Chi tiết Công việc**: Nhấp vào ngày để xem chi tiết công việc

#### 📊 Trang tổng quan Phân tích
- **Biểu đồ Tương tác**: Biểu đồ cột, tròn và đường sử dụng Chart.js
- **Thống kê Công việc**: Phân bố theo trạng thái, ưu tiên và danh mục
- **Lọc Khoảng thời gian**: Phân tích công việc trong khoảng thời gian cụ thể
- **Cập nhật Thời gian thực**: Biểu đồ cập nhật tự động khi công việc thay đổi

#### 📧 Lịch Gửi Email
- **Email Tự động Hàng ngày**: Gửi lịch công việc hàng ngày qua email
- **Mẫu Email Tùy chỉnh**: Mẫu email HTML đẹp mắt
- **Tích hợp EmailJS**: Gửi email không cần server
- **Quản lý Người nhận**: Lưu và quản lý địa chỉ email

### Tính năng Độc đáo

#### 🤖 Xử lý Giọng nói bằng AI
- Hiểu ngôn ngữ tự nhiên sử dụng Gemini 1.5-flash
- Hỗ trợ tiếng Việt cho lệnh giọng nói
- Trích xuất thông tin công việc thông minh từ giọng nói
- Lệnh điều hướng nhận biết ngữ cảnh

#### 🔔 Thông báo Thông minh
- Tự động cập nhật trạng thái công việc dựa trên ngày đến hạn
- Phát hiện công việc quá hạn và thông báo
- Hệ thống nhắc nhở cho deadline sắp đến
- Cập nhật trạng thái thời gian thực mỗi phút

#### 🔄 Hệ thống Lặp lại Nâng cao
- Mẫu lặp lại linh hoạt (hàng ngày, hàng tuần, hàng tháng)
- Chọn nhiều ngày để thiết lập lặp lại hàng loạt
- Cấu hình ngày kết thúc cho công việc lặp lại
- Tự động tạo công việc dựa trên mẫu

## 🛠️ Công nghệ Sử dụng

### Framework Frontend
- **React 18** với TypeScript để đảm bảo an toàn kiểu dữ liệu
- **Vite** để phát triển nhanh và build được tối ưu hóa
- **React Router** để định tuyến phía client

### UI & Styling
- **CSS Modules** với thiết kế responsive tùy chỉnh
- **Lucide React** để biểu tượng nhất quán
- **CSS Variables tùy chỉnh** để tạo chủ đề

### Quản lý Dữ liệu
- **LocalStorage** để lưu trữ dữ liệu phía client
- **Lớp Database tùy chỉnh** (`src/db.ts`) với các thao tác async
- **Giao diện TypeScript** để cấu trúc dữ liệu an toàn kiểu

### Tích hợp Bên thứ ba
- **Google Generative AI (Gemini)** để xử lý giọng nói
- **React Speech Recognition** để nhập giọng nói
- **EmailJS** để chức năng email
- **Chart.js** để trực quan hóa dữ liệu
- **React DatePicker** để chọn ngày

### Công cụ Phát triển
- **ESLint** để chất lượng code
- **TypeScript** để kiểm tra kiểu
- **Vite** để tối ưu hóa build

## 📁 Cấu trúc Dự án

```
src/
├── App.tsx                 # Component ứng dụng chính
├── App.css                 # Style ứng dụng chính
├── main.tsx               # Điểm vào ứng dụng
├── index.css              # Style toàn cục
├── vite-env.d.ts          # Định nghĩa kiểu Vite
├── db.ts                  # Thao tác database & kiểu dữ liệu
├── AnalyticsPage.tsx      # Trang tổng quan phân tích
├── AnalyticsPage.css      # Style trang phân tích
├── CalendarPage.tsx       # Chế độ xem lịch
├── CalendarPage.css       # Style trang lịch
├── EmailSchedulePage.tsx  # Lịch gửi email
├── EmailSchedulePage.css  # Style trang email
└── assets/                # Tài nguyên tĩnh
```

## 🗄️ Cấu trúc Database

### Cấu trúc Công việc
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;        // Chuỗi ngày ISO
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

### Lưu trữ Dữ liệu
- **LocalStorage** để duy trì dữ liệu
- **Định dạng JSON** để tuần tự hóa dữ liệu
- **Thao tác Async** với API dựa trên Promise
- **Tự động tạo ID** sử dụng timestamp

## 🚀 Hướng dẫn Sử dụng

### Bắt đầu
1. **Thiết lập**: Cài đặt dependencies và khởi động server phát triển
2. **Điều hướng**: Sử dụng thanh bên để điều hướng giữa các chế độ xem khác nhau
3. **Điều khiển Giọng nói**: Nhấp vào nút microphone để sử dụng lệnh giọng nói

### Quản lý Công việc
1. **Thêm Công việc**: Nhấp vào nút "+" hoặc sử dụng lệnh giọng nói
2. **Chỉnh sửa Công việc**: Nhấp đúp vào bất kỳ công việc nào để chỉnh sửa
3. **Hoàn thành Công việc**: Nhấp vào nút trạng thái để cập nhật tiến độ
4. **Xóa Công việc**: Sử dụng nút xóa với xác nhận

### Lệnh Giọng nói
- **Điều hướng**: "mở lịch", "mở analytics", "mở tasks", "mở email"
- **Tạo Công việc**: Nói tự nhiên, ví dụ: "Tạo task học toán vào ngày mai"
- **Trò chuyện AI**: Bất kỳ giọng nói không phải điều hướng nào cũng kích hoạt cuộc trò chuyện AI

### Tính năng Lịch
- **Xem Công việc**: Nhấp vào ngày để xem chi tiết công việc
- **Tạo Lặp lại**: Chọn nhiều ngày và thiết lập lặp lại
- **Điều hướng**: Sử dụng nút mũi tên để thay đổi tháng

### Phân tích
- **Lọc Dữ liệu**: Sử dụng bộ chọn khoảng thời gian
- **Loại Biểu đồ**: Chuyển đổi giữa biểu đồ cột, tròn và đường
- **Cập nhật Thời gian thực**: Biểu đồ cập nhật khi bạn sửa đổi công việc

## 🔧 Cấu hình

### Thiết lập Tích hợp AI
```typescript
// Trong AnalyticsPage.tsx và App.tsx
const API_KEY = 'your-gemini-api-key'; // Thay thế bằng key thực tế
const genAI = new GoogleGenerativeAI(API_KEY);
```

### Thiết lập Dịch vụ Email
```typescript
// Trong EmailSchedulePage.tsx
const SERVICE_ID = "your-emailjs-service-id";
const TEMPLATE_ID = "your-emailjs-template-id";
const PUBLIC_KEY = "your-emailjs-public-key";
```

## 🧠 Cải tiến Tương lai

### Tích hợp Backend
- **Server Node.js/Express** để đồng bộ dữ liệu
- **MongoDB** để lưu trữ dữ liệu có thể mở rộng
- **Xác thực người dùng** và hỗ trợ nhiều người dùng
- **Tính năng hợp tác thời gian thực**

### Ứng dụng Di động
- **Triển khai React Native**
- **Thông báo đẩy** để nhắc nhở công việc
- **Khả năng đồng bộ hóa ngoại tuyến**

### Tính năng AI Nâng cao
- **Lịch trình cá nhân hóa** dựa trên mẫu người dùng
- **Phân loại công việc thông minh** sử dụng học máy
- **Phân tích cảm xúc giọng nói** để điều chỉnh ưu tiên
- **Cải thiện phân tích ngôn ngữ tự nhiên** cho công việc

### Tính năng Bổ sung
- **Hợp tác nhóm** với không gian làm việc chia sẻ
- **Phân tích nâng cao** với hiểu biết dự đoán
- **API tích hợp** cho dịch vụ lịch (Google Calendar, Outlook)
- **Hệ thống game hóa** với thành tích và phần thưởng

## 📝 Ghi chú Phát triển

### Chất lượng Code
- **TypeScript** để an toàn kiểu và trải nghiệm nhà phát triển tốt hơn
- **Cấu hình ESLint** để phong cách code nhất quán
- **Kiến trúc mô-đun** với các mối quan tâm tách biệt
- **Thiết kế responsive** cho di động và máy tính để bàn

### Tối ưu hóa Hiệu suất
- **Lazy loading** cho các component route
- **Memoization** cho các tính toán tốn kém
- **Re-render hiệu quả** sử dụng React hooks
- **Tối ưu hóa LocalStorage** để duy trì dữ liệu

### Hỗ trợ Trình duyệt
- **Trình duyệt hiện đại** với hỗ trợ ES6+
- **API Microphone** để nhận dạng giọng nói
- **LocalStorage** để duy trì dữ liệu
- **Thiết kế responsive** cho các kích thước màn hình khác nhau

## ✅ Danh sách Kiểm tra
- [x] Code chạy không có lỗi
- [x] Tất cả tính năng bắt buộc đã triển khai
- [x] Nhận dạng giọng nói với tích hợp AI
- [x] Chế độ xem lịch với hỗ trợ lặp lại
- [x] Trang tổng quan phân tích với biểu đồ tương tác
- [x] Chức năng lịch gửi email
- [x] Thiết kế responsive cho di động và máy tính để bàn
- [x] Triển khai TypeScript để an toàn kiểu
- [x] LocalStorage để duy trì dữ liệu
- [x] Tài liệu toàn diện

## 📄 Giấy phép
Dự án này được phát triển cho Naver Vietnam AI Hackathon 2024.

## 👥 Người đóng góp
- PDN237 - Nhà phát triển chính

---

*Được xây dựng với ❤️ sử dụng React, TypeScript và các tính năng AI cho Naver Vietnam AI Hackathon 2024*
