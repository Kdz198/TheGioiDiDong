package fpt.com.orderservice.service;

import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.dto.OrderDto;
import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.model.dto.OrderResponse;
import fpt.com.orderservice.model.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<OrderDto> findAll();
    OrderDto findById(int id);
    OrderDto save(OrderRequest order);
    OrderDto update(int orderId, OrderStatus status);
    void deleteById(int id);
    List<OrderDto> findByUserId(int userId);
    List<OrderDto> findByStatus(OrderStatus status);
}

