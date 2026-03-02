package tgdd.org.productservice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tgdd.org.productservice.config.RabbitMQConfig;

@Slf4j
@Component
public class TestListener {

    public record Student(String name, int age, String school) {}

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void receiveMessage(Student student) {
        log.info("==================================================");
        log.info("🎉 TING TING! CÓ TIN NHẮN MỚI TỪ RABBITMQ!");
        log.info("👤 Tên học sinh: {}", student.name());
        log.info("🎂 Tuổi: {}", student.age());
        log.info("🏫 Trường học: {}", student.school());
        log.info("📦 Toàn bộ Object: {}", student);
        log.info("==================================================");

    }
}
