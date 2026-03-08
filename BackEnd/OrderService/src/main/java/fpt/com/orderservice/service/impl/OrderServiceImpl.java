package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.OrderDetail;
import fpt.com.orderservice.model.Promotion;
import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.model.dto.OrderResponse;
import fpt.com.orderservice.model.enums.OrderStatus;
import fpt.com.orderservice.model.enums.PromotionType;
import fpt.com.orderservice.repo.OrderRepo;
import fpt.com.orderservice.repo.PromotionRepo;
import fpt.com.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepo orderRepo;
    @Autowired
    private PromotionRepo promotionRepo;

    @Override
    public List<OrderResponse> findAll() {
        return orderRepo.findAll().stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    public OrderResponse findById(int id) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse save(OrderRequest orderRequest) {
        Order newOrder = new Order();
        newOrder.setUserId(orderRequest.getUserId());
        newOrder.setStatus(OrderStatus.PENDING);
        newOrder.setTotalPrice(orderRequest.getTotalPrice());
        newOrder.setBasePrice(orderRequest.getBasePrice());
        newOrder.setOrderCode(orderRequest.getOrderCode());

        List<OrderDetail> details = new ArrayList<>();
        for (OrderRequest.OrderDetailRequest detailRequest : orderRequest.getOrderDetails()) {
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setProductId(detailRequest.getProductId());
            orderDetail.setQuantity(detailRequest.getQuantity());
            orderDetail.setSubtotal(detailRequest.getSubtotal());
            orderDetail.setType(detailRequest.getType());
            details.add(orderDetail);
        }
        newOrder.setOrderDetails(details);
        return toOrderResponse(orderRepo.save(newOrder));
    }

    @Override
    public OrderResponse update(int orderId, OrderStatus status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status);
        return toOrderResponse(orderRepo.save(order));
    }

    @Override
    public void deleteById(int id) {
        orderRepo.deleteById(id);
    }

    @Override
    public List<OrderResponse> findByUserId(int userId) {
        return orderRepo.findByUserId(userId).stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> findByStatus(OrderStatus status) {
        return orderRepo.findByStatus(status).stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    private OrderResponse toOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .basePrice(order.getBasePrice())
                .orderDetails(order.getOrderDetails())
                .build();
    }
}

