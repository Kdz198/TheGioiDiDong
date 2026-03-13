package fpt.com.orderservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        // Tạo một RestTemplate sử dụng Apache HttpClient
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate;
    }
}
