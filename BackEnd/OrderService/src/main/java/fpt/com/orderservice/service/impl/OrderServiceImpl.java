package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.OrderDetail;
import fpt.com.orderservice.model.Promotion;
import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.model.enums.OrderStatus;
import fpt.com.orderservice.model.enums.PromotionType;
import fpt.com.orderservice.repo.OrderDetailRepo;
import fpt.com.orderservice.repo.OrderRepo;
import fpt.com.orderservice.repo.PromotionRepo;
import fpt.com.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepo orderRepo;
    @Autowired
    private PromotionRepo promotionRepo;
    @Autowired
    private OrderDetailRepo orderDetailRepo;

    @Override
    public List<Order> findAll() {
        return orderRepo.findAll();
    }

    @Override
    public Order findById(int id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Override
    @Transactional
    public Order save(OrderRequest orderRequest) {
        Promotion promotion = promotionRepo.findByCode(orderRequest.getPromotionCode());
        if(promotion == null) {
            throw new RuntimeException("Promotion not found with code: " + orderRequest.getPromotionCode());
        }
        int discountValue = 0;
        if(promotion.getType() == PromotionType.MONEY) {
            discountValue = promotion.getDiscountValue();
        } else if(promotion.getType() == PromotionType.PERCENTAGE) {
            discountValue = orderRequest.getBasePrice() * promotion.getDiscountValue() / 100;
            if(discountValue > promotion.getMaxDiscountValue()) {
                discountValue = promotion.getMaxDiscountValue();
            }
        }
        Order newOrder = new Order();
        newOrder.setUserId(orderRequest.getUserId());
        newOrder.setPromotion(promotion);
        newOrder.setStatus(OrderStatus.PENDING);
        newOrder.setTotalPrice(orderRequest.getTotalPrice());
        newOrder.setBasePrice(orderRequest.getBasePrice());
        newOrder.setDiscount(discountValue);
        Order savedOrder = orderRepo.save(newOrder);

        for(OrderRequest.OrderDetailRequest detailRequest : orderRequest.getOrderDetails()) {
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setProductId(detailRequest.getProductId());
            orderDetail.setQuantity(detailRequest.getQuantity());
            orderDetail.setSubtotal(detailRequest.getSubtotal());
            orderDetail.setType(detailRequest.getType());
            orderDetailRepo.save(orderDetail);
        }
        return savedOrder;
    }

    @Override
    public Order update(Order order) {
        if (!orderRepo.existsById(order.getId())) {
            throw new RuntimeException("Order not found with id: " + order.getId());
        }
        return orderRepo.save(order);
    }

    @Override
    public void deleteById(int id) {
        orderRepo.deleteById(id);
    }

    @Override
    public List<Order> findByUserId(int userId) {
        return orderRepo.findByUserId(userId);
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        return orderRepo.findByStatus(status);
    }
}

