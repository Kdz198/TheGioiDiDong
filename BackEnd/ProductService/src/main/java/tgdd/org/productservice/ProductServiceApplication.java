package tgdd.org.productservice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.Connection;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@RequiredArgsConstructor
@Slf4j
public class ProductServiceApplication implements CommandLineRunner {

    private final ConnectionFactory connectionFactory;

    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("⏳ Đang kiểm tra kết nối tới CloudAMQP...");
        try (Connection connection = connectionFactory.createConnection()) {
            log.info("✅ KẾT NỐI RABBITMQ THÀNH CÔNG!");
            log.info("🔗 Đang trỏ tới Host: {}", connectionFactory.getHost());
            log.info("🚪 Port giao tiếp: {}", connectionFactory.getPort());
            log.info("🏠 Virtual Host: {}", connectionFactory.getVirtualHost());
        } catch (Exception e) {
            log.error("❌ KẾT NỐI RABBITMQ THẤT BẠI. Vui lòng kiểm tra lại URL/Password!");
            log.error("Chi tiết lỗi: {}", e.getMessage());
        }
        System.out.println("Product Service is running...");
    }
}
