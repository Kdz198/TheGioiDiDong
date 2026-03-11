package fpt.com.orderservice.feignclient;

import fpt.com.orderservice.model.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "PRODUCT-SERVICE")
public interface ProductClient {
    @GetMapping("/api/products/product/{id}")
    ProductResponse getProductById(@PathVariable int id);
}
