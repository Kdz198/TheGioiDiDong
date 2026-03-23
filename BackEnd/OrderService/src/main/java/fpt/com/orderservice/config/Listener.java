package fpt.com.orderservice.config;

import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.service.OrderService;
import fpt.com.orderservice.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
@Slf4j

@Service
public class Listener {
    private final OrderService orderService;
    private final PaymentService paymentService;

    public Listener(OrderService orderService, PaymentService paymentService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    @RabbitListener(queues = "${app.rabbitmq.prefix}.tgdd.order.queue")
    public void orderCreate(OrderRequest orderRequest) {
        if(orderRequest.getPaymentMethod().equals(OrderRequest.PaymentMethod.PAYOS)){
            log.info("Order created: {}", orderRequest);
            orderService.save(orderRequest);
        }
        else{
            log.info("Order created with cash: {}", orderRequest);
            orderService.save(orderRequest);
            paymentService.saveWithCashMethod(orderRequest.getOrderCode());
        }
    }
}
