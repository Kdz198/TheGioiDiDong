package fpt.com.orderservice.service;

import fpt.com.orderservice.model.OrderDetail;

import java.util.List;

public interface OrderDetailService {
    List<OrderDetail> findAll();
    OrderDetail findById(int id);
    OrderDetail save(OrderDetail orderDetail);
    OrderDetail update(OrderDetail orderDetail);
    void deleteById(int id);
    List<OrderDetail> findByOrderId(int orderId);
    List<OrderDetail> findByProductId(int productId);
}

