package fpt.com.orderservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders/health")
public class HealthCheck {

    @GetMapping("health-check")
    public String healthCheck() {
        return "Order Service is healthy!";
    }

    @GetMapping
    public String welcome() {
        return "Welcome to Order Service!";
    }
}
