package tgdd.org.productservice.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.model.dto.OrderRequest;

@Service
public class Producer {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private Queue productQueue;
    @Value("${app.rabbitmq.prefix}")
    String prefix;

    public void publishOrderAvailable(OrderRequest request){
        System.err.println("Queue: " + productQueue.getName());
        System.out.println("Publishing order available: " + request);
        rabbitTemplate.convertAndSend(prefix+"." +RabbitMQConfig.EXCHANGE_NAME,"product.available", request);
    }
}
