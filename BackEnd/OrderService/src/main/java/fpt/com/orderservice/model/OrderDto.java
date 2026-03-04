package fpt.com.orderservice.model;

import lombok.Data;

import java.util.List;

@Data
public class OrderDto {
    int orderId;
    List<OrderItem> items;

    @Data
    public static class OrderItem{
        int productId;
        int quantity;
    }
}
