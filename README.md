# 🛒 TGDD - Electronics E-Commerce Platform

![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.x-brightgreen.svg)
![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue.svg)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions_Matrix-2088FF.svg)
![Docker](https://img.shields.io/badge/Deployed_with-Docker_%7C_Dockge-2496ED.svg)

Dự án xây dựng nền tảng thương mại điện tử chuyên cung cấp các thiết bị điện tử, phụ kiện công nghệ (lấy cảm hứng từ mô hình Thế Giới Di Động). Dự án được thiết kế theo kiến trúc **Microservices** và quản lý source code dưới dạng **Monorepo**, đi kèm với hệ thống CI/CD và hạ tầng tự lưu trữ (Self-hosted) tự động hóa hoàn toàn.

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

Dự án áp dụng kiến trúc **Microservices** để đảm bảo tính mở rộng và độc lập giữa các nghiệp vụ. Toàn bộ source code của các dịch vụ được quản lý tập trung trong một **Monorepo** duy nhất để dễ dàng theo dõi và chia sẻ cấu hình.

* **API Gateway (Spring Cloud Gateway):** Cổng giao tiếp duy nhất (Single entry point) cho toàn bộ request từ Client/Frontend.
* **Service Registry (Netflix Eureka):** Quản lý trạng thái và định tuyến nội bộ (Internal DNS) cho các Microservices.
* **User Service:** Quản lý thông tin người dùng, xác thực và phân quyền.
* **Product Service:** Quản lý danh mục sản phẩm, kho hàng và giá cả.
* *(Và các services nghiệp vụ khác sẽ được mở rộng trong tương lai...)*

---

## 🚀 DevOps & CI/CD Pipeline

Hệ thống được vận hành tự động 100% từ khâu viết code đến khi ứng dụng chạy trên máy chủ thực tế, tối ưu hóa cho môi trường Home Lab.

### 1. Luồng CI/CD (Continuous Integration / Continuous Deployment)
Dự án sử dụng **GitHub Actions Dynamic Matrix** kết hợp với `dorny/paths-filter` để tối ưu hóa quá trình build trong Monorepo:
* **Smart Detection:** Chỉ trigger build và test chính xác những Microservice có sự thay đổi source code, bỏ qua các service không liên quan giúp tiết kiệm tài nguyên.
* **Isolated Testing:** Tự động spin-up Database ảo (PostgreSQL) thông qua Service Containers trong quá trình chạy CI test.
* **Multi-stage Docker Build:** Tự động đóng gói ứng dụng bằng JRE 21 Alpine siêu nhẹ, tối ưu JVM cho tốc độ khởi động nhanh và đẩy image lên Docker Hub.

### 2. Hạ Tầng Triển Khai (Self-Hosted Home Lab)
Toàn bộ Microservices được host trên server vật lý (Ubuntu 24.04) quản lý thông qua **Dockge**:
* **Quản trị tập trung với Dockge (IaC):** Hệ thống không chạy các container rời rạc mà được quy hoạch bài bản thành các cụm dịch vụ (Stack) thông qua `docker-compose.yaml`. Toàn bộ kiến trúc Microservices được triển khai và giám sát trực quan ngay trên giao diện Web của **Dockge**.
* **Smart CD với Watchtower:** Khép kín hoàn toàn luồng Continuous Deployment. Watchtower hoạt động ngầm để lắng nghe Docker Hub, tự động đối chiếu hash và **chỉ pull & restart chính xác container nào có mã nguồn thay đổi**. Các service khác trong cùng Stack vẫn tiếp tục phục vụ traffic bình thường, đảm bảo update không gián đoạn (Zero-impact update).
* **Internal Networking:** Các Microservices giao tiếp hoàn toàn qua mạng nội bộ của Docker (`tgdd-net`). Chỉ duy nhất API Gateway được mở port ra ngoài.
* **Bảo mật & Phân phối:** Cổng API Gateway được expose ra môi trường Internet thông qua **Cloudflare Tunnel**, bảo vệ hệ thống khỏi các đợt DDoS và ẩn hoàn toàn IP thực của Server.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend
* **Ngôn ngữ:** Java 21
* **Framework:** Spring Boot 4, Spring Cloud (Gateway, Netflix Eureka)
* **Database:** PostgreSQL
* **Build Tool:** Maven Wrapper

### DevOps & Infrastructure
* **Containerization:** Docker, Docker Compose
* **Container Manager:** Dockge
* **Automation:** GitHub Actions, Watchtower
* **Networking & Security:** Cloudflare Tunnel

---

## 📝 Chức Năng (Features - Coming Soon)

- [ ] Quản lý xác thực người dùng (Login/Register/JWT).
- [ ] Quản lý danh mục và chi tiết sản phẩm điện tử.
- [ ] Giỏ hàng và quy trình thanh toán (Checkout).
- [ ] Quản lý đơn hàng và trạng thái giao hàng.
- [ ] Tích hợp thanh toán qua cổng điện tử (PayOS/VNPay).

---

## 💻 Hướng Dẫn Chạy Môi Trường Local

Nếu bạn muốn chạy dự án này dưới máy tính cá nhân (Local Development):

1. Clone repository:
   ```bash
   git clone [https://github.com/your-username/TGDD-Monorepo.git](https://github.com/your-username/TGDD-Monorepo.git)
