package fpt.com.orderservice.model.dto;

import fpt.com.orderservice.model.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
@Builder
public class OrderDto {
    int id;
    String userName;
    OrderStatus status;
    int totalPrice;
    int basePrice;
    String orderCode;
    Timestamp orderDate;
    List<OrderDetailRequest> orderDetails;

    @Data
    public static class OrderDetailRequest{
        int orderDetailId;
        int productId;
        String productName;
        String imgUrl;
        int quantity;
        int subtotal;
        String type;
    }
}
