package fpt.com.orderservice.controller;

import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.model.dto.OrderResponse;
import fpt.com.orderservice.model.enums.OrderStatus;
import fpt.com.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable int id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest order) {
        return ResponseEntity.ok(orderService.save(order));
    }

    @PutMapping
    public ResponseEntity<OrderResponse> updateOrderint (@RequestParam int orderId, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.update(orderId, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable int id) {
        orderService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(orderService.findByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.findByStatus(status));
    }
}

