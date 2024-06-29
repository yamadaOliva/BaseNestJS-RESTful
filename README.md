# Dự án Backend

## Hướng dẫn cài đặt

1. Cài đặt các phụ thuộc: `yarn add`
2. Khởi động Docker Compose: `sudo docker-compose up -d`
3. Tạo Prisma Client: `npx prisma generate`
4. Chạy các bước migration cho database: `npx prisma migrate dev`
5. Nạp dữ liệu vào database (tuỳ chọn): `yarn seed`
6. Khởi động máy chủ phát triển: `yarn start:dev`

Vui lòng đảm bảo Docker đã được cài đặt và đang chạy trước khi khởi động các dịch vụ Docker Compose. Thay đổi các lệnh tùy theo cấu hình của dự án của bạn.
