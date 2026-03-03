package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.model.OrderDetail;
import fpt.com.orderservice.repo.OrderDetailRepo;
import fpt.com.orderservice.service.OrderDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderDetailServiceImpl implements OrderDetailService {

    @Autowired
    private OrderDetailRepo orderDetailRepo;

    @Override
    public List<OrderDetail> findAll() {
        return orderDetailRepo.findAll();
    }

    @Override
    public OrderDetail findById(int id) {
        return orderDetailRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderDetail not found with id: " + id));
    }

    @Override
    public OrderDetail save(OrderDetail orderDetail) {
        return orderDetailRepo.save(orderDetail);
    }

    @Override
    public OrderDetail update(OrderDetail orderDetail) {
        if (!orderDetailRepo.existsById(orderDetail.getId())) {
            throw new RuntimeException("OrderDetail not found with id: " + orderDetail.getId());
        }
        return orderDetailRepo.save(orderDetail);
    }

    @Override
    public void deleteById(int id) {
        orderDetailRepo.deleteById(id);
    }

    @Override
    public List<OrderDetail> findByOrderId(int orderId) {
        return orderDetailRepo.findByOrderId(orderId);
    }

    @Override
    public List<OrderDetail> findByProductId(int productId) {
        return orderDetailRepo.findByProductId(productId);
    }
}

