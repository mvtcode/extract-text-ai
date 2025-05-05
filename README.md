# Extract Text AI

Ứng dụng chuyển đổi giọng nói thành văn bản và so sánh với văn bản gốc, sử dụng OpenAI Whisper API.

## Tính năng

- Chuyển đổi file âm thanh thành văn bản sử dụng OpenAI Whisper API
- So sánh văn bản chuyển đổi với văn bản gốc
- Tính toán độ chính xác của quá trình chuyển đổi
- Giao diện web thân thiện với người dùng
- Hỗ trợ nhập văn bản trực tiếp hoặc tải lên file âm thanh
- Trích xuất và so sánh các biến từ template sử dụng AI
- Hiển thị chi tiết kết quả so sánh với các chỉ số độ chính xác
- Hỗ trợ nhiều định dạng âm thanh (mp3, wav, ogg, m4a, aac, webm, flac, mpeg, mp4)

## Quá trình trích xuất giá trị từ template

Ứng dụng sử dụng thuật toán so sánh văn bản thông minh và AI để trích xuất và so sánh các giá trị từ template. Quá trình này bao gồm các bước sau:

1. **Tiền xử lý văn bản**:
   - Chuẩn hóa văn bản (chuyển về chữ thường, loại bỏ dấu câu)
   - Tách từ và chuẩn hóa khoảng trắng
   - Xử lý các trường hợp đặc biệt (số, ngày tháng, đơn vị đo lường)

2. **Trích xuất giá trị với AI**:
   - Sử dụng GPT-4 để trích xuất các giá trị từ văn bản dựa trên template
   - Tính toán độ tin cậy cho mỗi giá trị được trích xuất
   - Xử lý các trường hợp đặc biệt và ngữ cảnh

3. **So sánh và trích xuất**:
   - Sử dụng thuật toán fuzzy matching để tìm các từ tương đồng
   - Tính toán độ tương đồng giữa các từ (sử dụng thư viện fuzzball)
   - Xác định ngưỡng chấp nhận cho độ tương đồng
   - Trích xuất các giá trị khớp với template

4. **Xử lý các trường hợp đặc biệt**:
   - Xử lý các từ viết tắt
   - Xử lý các từ đồng nghĩa
   - Xử lý các trường hợp viết hoa/viết thường
   - Xử lý các lỗi chính tả thông dụng

5. **Tính toán độ chính xác**:
   - So sánh từng từ giữa văn bản gốc và văn bản chuyển đổi
   - Tính toán tỷ lệ khớp chính xác
   - Đánh dấu các từ khác biệt
   - Hiển thị kết quả với các chỉ số chi tiết

6. **Kết quả trả về**:
   - Văn bản đã được chuẩn hóa
   - Các giá trị trích xuất được với độ tin cậy
   - Độ chính xác của quá trình trích xuất
   - Các từ khác biệt được đánh dấu
   - Thống kê chi tiết về kết quả so sánh

Ví dụ về kết quả trích xuất:
```
Văn bản gốc: "Họ và tên: Nguyễn Văn A, Số điện thoại: 0123456789"
Văn bản chuyển đổi: "Họ và tên Nguyễn Văn A Số điện thoại 0123456789"

Kết quả trích xuất:
- Họ và tên: Nguyễn Văn A (Độ chính xác: 100%)
- Số điện thoại: 0123456789 (Độ chính xác: 100%)
- Tổng độ chính xác: 100%
```

## Giao diện người dùng

Ứng dụng có giao diện đơn giản và trực quan với các phần chính sau:

1. **Phần tải lên file**:
   - Nút tải lên file âm thanh (hỗ trợ các định dạng: mp3, wav, m4a)
   - Ô nhập văn bản gốc để so sánh
   - Nút "Chuyển đổi" để bắt đầu quá trình xử lý

2. **Phần kết quả**:
   - Hiển thị văn bản đã chuyển đổi từ âm thanh
   - Hiển thị văn bản gốc để so sánh
   - Hiển thị độ chính xác của quá trình chuyển đổi (tính bằng phần trăm)
   - Các từ khác biệt được đánh dấu màu để dễ nhận biết

3. **Phần thông tin**:
   - Hiển thị thời gian xử lý
   - Hiển thị trạng thái của quá trình chuyển đổi
   - Hiển thị thông báo lỗi (nếu có)

## Yêu cầu hệ thống

- Node.js >= 16.x
- npm >= 8.x
- OpenAI API key

## Cài đặt

1. Clone repository:
```bash
git clone git@github.com:mvtcode/extract-text-ai.git
cd extract-text-ai
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` và thêm OpenAI API key:
```env
OPENAI_API_KEY=your-api-key-here
```

## Cấu trúc dự án

```
extract-text-ai/
├── src/
│   ├── index.ts           # Điểm khởi đầu của ứng dụng
│   ├── routes/            # Định nghĩa các routes
│   ├── services/          # Các dịch vụ xử lý logic
│   └── public/            # Tài nguyên tĩnh
├── uploads/               # Thư mục lưu trữ file tải lên
├── package.json
├── tsconfig.json
└── README.md
```

## Cách sử dụng

1. Khởi động server:
```bash
npm run dev
```

2. Truy cập ứng dụng tại `http://localhost:3000`

3. Tải lên file âm thanh và văn bản gốc để so sánh

## Các lệnh phát triển

- `npm run dev`: Chạy server ở chế độ development
- `npm run build`: Build ứng dụng
- `npm run start`: Chạy ứng dụng đã build
- `npm run lint`: Kiểm tra lỗi ESLint
- `npm run lint:fix`: Tự động sửa lỗi ESLint
- `npm run format`: Định dạng code với Prettier
- `npm run format:check`: Kiểm tra định dạng code

## Công nghệ sử dụng

- Node.js
- TypeScript
- Express.js
- OpenAI Whisper API
- ESLint & Prettier

## Screenshot

![Screenshot](./screenshot.png)

## Liên hệ

- **Tác giả**: Mạc Tân
- **Skype**: trai_12a1
- **Email**: macvantan@gmail.com
- **Telegram**: tanmv
- **Facebook**: mvt.hp.star

## Giấy phép

MIT License 