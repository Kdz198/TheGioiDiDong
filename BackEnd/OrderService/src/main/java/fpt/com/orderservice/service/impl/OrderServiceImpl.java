package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.feignclient.ProductClient;
import fpt.com.orderservice.feignclient.UserClient;
import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.OrderDetail;
import fpt.com.orderservice.model.Promotion;
import fpt.com.orderservice.model.dto.OrderDto;
import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.model.dto.OrderResponse;
import fpt.com.orderservice.model.dto.ProductResponse;
import fpt.com.orderservice.model.enums.OrderStatus;
import fpt.com.orderservice.model.enums.PromotionType;
import fpt.com.orderservice.repo.OrderRepo;
import fpt.com.orderservice.repo.PromotionRepo;
import fpt.com.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private UserClient userClient;
    @Autowired
    private ProductClient productClient;

    @Override
    public List<OrderDto> findAll() {
        return orderRepo.findAll().stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    public OrderDto findById(int id) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderDto save(OrderRequest orderRequest) {
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
    public OrderDto update(int orderId, OrderStatus status) {
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
    public List<OrderDto> findByUserId(int userId) {
        return orderRepo.findByUserId(userId).stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> findByStatus(OrderStatus status) {
        return orderRepo.findByStatus(status).stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    private OrderDto toOrderResponse(Order order) {
        List<OrderDto.OrderDetailRequest> orderDetails = new ArrayList<>();
        for (OrderDetail detail : order.getOrderDetails()) {
            ProductResponse product = productClient.getProductById(detail.getProductId());
            OrderDto.OrderDetailRequest detailResponse = new OrderDto.OrderDetailRequest();
            detailResponse.setOrderDetailId(detail.getId());
            detailResponse.setProductId(detail.getProductId());
            detailResponse.setProductName(product.getName());
            detailResponse.setImgUrl(product.getImgUrls().get(0));
            detailResponse.setQuantity(detail.getQuantity());
            detailResponse.setSubtotal(detail.getSubtotal());
            detailResponse.setType(detail.getType());
            orderDetails.add(detailResponse);
        }
        String userName = userClient.getNameAccount(order.getUserId());
        return OrderDto.builder()
                .id(order.getId())
                .userName(userName)
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .basePrice(order.getBasePrice())
                .orderCode(order.getOrderCode())
                .orderDate(order.getOrderDate())
                .orderDetails(orderDetails)
                .build();
    }

    @Scheduled(fixedDelay = 300000)
    public void cancelOrder() {
        LocalDateTime times = LocalDateTime.now().minusMinutes(10);
        List<Order> orders = orderRepo.findByStatusAndOrderDateBefore(OrderStatus.PENDING, Timestamp.valueOf(times));
        for (Order order : orders) {
            order.setStatus(OrderStatus.CANCELED);
        }
        orderRepo.saveAll(orders);
    }
}

