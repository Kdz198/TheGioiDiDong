package tgdd.org.productservice.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    int userId;
    OrderStatus status;
    int totalPrice;
    int basePrice;
    String orderCode;
    List<OrderDetailRequest> orderDetails;
    List<OrderInfo> orderInfo ;
    String note;

    @Data
    public static class OrderDetailRequest{
        int productId;
        int quantity;
        int subtotal;
        String type;
    }

    public enum OrderStatus{
        PENDING,
        PAID,
        CANCELED,
    }
    @Data
    public static class OrderInfo {
        String phoneNumber;
        String address;
        String recipientName;
    }
}

