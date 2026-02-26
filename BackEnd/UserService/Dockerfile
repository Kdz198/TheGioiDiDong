# ==========================================
# STAGE 1: BUILD (Tối ưu Cache & Fix Windows CRLF)
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Cài dos2unix để phòng ngừa lỗi dòng lệnh nếu code được push từ Windows
RUN apk add --no-cache dos2unix

# Copy cấu hình Maven trước để tận dụng Docker Cache cho bước tải thư viện
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Convert line ending và cấp quyền thực thi ngay cho mvnw
RUN dos2unix mvnw && chmod +x ./mvnw

# Tải dependencies offline (Docker sẽ cache lại bước này nếu pom.xml không đổi)
RUN ./mvnw dependency:go-offline -B

# Copy toàn bộ source code vào và tiến hành build (bỏ qua Test vì đã chạy ở CI)
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ==========================================
# STAGE 2: RUNTIME (Tối ưu RAM/CPU cho máy Vaio)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Tạo non-root user để tăng cường bảo mật cho máy chủ Ubuntu
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# Copy file JAR thành phẩm từ Stage 1 sang (dùng wildcard để không bị lỗi version)
COPY --from=builder /app/target/*.jar app.jar

# Mở port 8091 theo đúng cấu hình server.port của USER-SERVICE
EXPOSE 8091

# Tối ưu JVM cho CPU Vaio đời cũ:
# - Khởi động nhanh hơn với /dev/./urandom
# - Giảm tải JIT Compiler lúc startup với TieredCompilation
ENTRYPOINT ["java", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-XX:+TieredCompilation", \
            "-XX:TieredStopAtLevel=1", \
            "-jar", \
            "app.jar"]