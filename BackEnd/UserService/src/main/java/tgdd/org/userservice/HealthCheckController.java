package tgdd.org.userservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class HealthCheckController {


    @GetMapping("health-check")
    public String healthCheckV1() {
        return "User Service is healthy! (v1)";
    }

    @GetMapping
    public String welcome() {
        return "Welcome to User Service!";
    }

    @GetMapping("health")
    public String healthCheck() {
        return "User Service is healthy!";
        }
}
