package fpt.com.orderservice;

import fpt.com.orderservice.annotation.RequireAuth;
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

    @RequireAuth( roles = {"ADMIN", "STAFF", "USER"})
    @GetMapping
    public String welcome() {
        return "Welcome to Order Service!";
    }
}
