package tgdd.org.productservice.model.dto.request;

import jakarta.validation.constraints.NotNull;
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
    @NotNull
    PaymentMethod paymentMethod;

    @Data
    public static class OrderDetailRequest{
        int productId;
        int quantity;
        int subtotal;
        String type;
    }

    public enum PaymentMethod {
        CASH,
        PAYOS
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

