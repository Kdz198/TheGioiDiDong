package fpt.com.orderservice.service;

import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.model.dto.OrderResponse;
import fpt.com.orderservice.model.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<OrderResponse> findAll();
    OrderResponse findById(int id);
    OrderResponse save(OrderRequest order);
    OrderResponse update(int orderId, OrderStatus status);
    void deleteById(int id);
    List<OrderResponse> findByUserId(int userId);
    List<OrderResponse> findByStatus(OrderStatus status);
}

