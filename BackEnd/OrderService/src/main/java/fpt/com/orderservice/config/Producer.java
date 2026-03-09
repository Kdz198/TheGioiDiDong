package fpt.com.orderservice.config;


import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class Producer {

    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Value("${app.rabbitmq.prefix}")
    String prefix;

    public void publishPaymentSuccess(String orderCode) {
        log.info("Publish payment success");
        rabbitTemplate.convertAndSend(prefix+"." +RabbitMQConfig.EXCHANGE_NAME,"payment.success", orderCode);
    }

    public void publishPaymentCancel(String orderCode) {
        log.info("Publish payment cancel");
        rabbitTemplate.convertAndSend(prefix+"." +RabbitMQConfig.EXCHANGE_NAME,"payment.fail", orderCode);
    }
}
