package fpt.com.orderservice.config;

import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
@Slf4j

@Service
public class Listener {
    private final OrderService orderService;

    public Listener(OrderService orderService) {
        this.orderService = orderService;
    }

    @RabbitListener(queues = "${app.rabbitmq.prefix}.tgdd.order.queue")
    public void orderCreate(OrderRequest orderRequest) {
        log.info("Order created: {}", orderRequest);
        orderService.save(orderRequest);
    }
}
