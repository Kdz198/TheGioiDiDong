package tgdd.org.productservice.config;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.model.dto.OrderRequest;

@Service
public class Producer {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishOrderAvailable(OrderRequest request){
        System.out.println("Publishing order available: " + request);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME,"product.available", request);
    }
}
