package fpt.com.orderservice.service;

import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.model.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<Order> findAll();
    Order findById(int id);
    Order save(OrderRequest order);
    Order update(Order order);
    void deleteById(int id);
    List<Order> findByUserId(int userId);
    List<Order> findByStatus(OrderStatus status);
}

