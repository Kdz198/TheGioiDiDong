package tgdd.org.productservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.service.ProductService;

@Slf4j
@Service
public class Listener {
    private final ProductService productService;

    public Listener(ProductService productService) {
        this.productService = productService;
    }

    @RabbitListener(queues = "${app.rabbitmq.prefix}.tgdd.product.queue")
    public void handleInventory(@Payload String orderCode,
                                @Header(AmqpHeaders.RECEIVED_ROUTING_KEY) String routingKey) {
        switch (routingKey) {
            case "payment.success":
                log.info("Received product deduct message for order: " + orderCode);
                productService.deductStock(orderCode);
                break;
            case "payment.fail":
                log.info("Received product rollback message for order: " + orderCode);
                productService.restoreStock(orderCode);
                break;
            default:
                log.warn("Received message with unknown routing key: " + routingKey);
        }
    }


}
