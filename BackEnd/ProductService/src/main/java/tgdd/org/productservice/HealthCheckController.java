package tgdd.org.productservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tgdd.org.productservice.annotation.RequireAuth;

@RestController
@RequestMapping("/api/products/health")
public class HealthCheckController {

    @GetMapping("health-check")
    public String healthCheckV1() {
        return "Product Service is healthy! (v1)";
    }

    @RequireAuth( roles = {"ADMIN", "STAFF", "USER"})
    @GetMapping
    public String welcome() {
        return "Welcome to Product Service!";
    }
}
