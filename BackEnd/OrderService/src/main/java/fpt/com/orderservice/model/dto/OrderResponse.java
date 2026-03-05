package fpt.com.orderservice.model.dto;

import fpt.com.orderservice.model.OrderDetail;
import fpt.com.orderservice.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    int id;
    int userId;
    PromotionInfo promotion;
    Timestamp orderDate;
    OrderStatus status;
    int totalPrice;
    int basePrice;
    int discount;
    List<OrderDetail> orderDetails;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PromotionInfo {
        int id;
        String code;
        String description;
    }

}

