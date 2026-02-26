# ==========================================
# STAGE 1: BUILD (Tối ưu Cache & Fix Windows CRLF)
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# 1. Cài dos2unix để phòng ngừa lỗi dòng lệnh Windows
RUN apk add --no-cache dos2unix

# 2. Copy cấu hình Maven trước để tận dụng Docker Cache
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# 3. Convert line ending và cấp quyền thực thi ngay cho mvnw
RUN dos2unix mvnw && chmod +x ./mvnw

# 4. Tải dependencies (Bước này sẽ được cache lại nếu pom.xml không đổi)
RUN ./mvnw dependency:go-offline -B

# 5. Copy source code và build
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ==========================================
# STAGE 2: RUNTIME (Tối ưu RAM/CPU cho máy Vaio)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Chạy app bằng user thường để bảo mật cho máy chủ Ubuntu
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# Dùng dấu * để không bị phụ thuộc vào version trong pom.xml
COPY --from=builder /app/target/*.jar app.jar

# Sửa port này tương ứng với từng service (Eureka: 8761, Gateway: 8090...)
EXPOSE 8761

# Tối ưu JVM cho CPU đời cũ khởi động nhanh
ENTRYPOINT ["java", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-XX:+TieredCompilation", \
            "-XX:TieredStopAtLevel=1", \
            "-jar", \
            "app.jar"]