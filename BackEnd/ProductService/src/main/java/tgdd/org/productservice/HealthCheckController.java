package tgdd.org.productservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @GetMapping("health-check")
    public String healthCheckV1() {
        return "Product Service is healthy! (v1)";
    }

    @GetMapping
    public String welcome() {
        return "Welcome to Product Service!";
    }
}
