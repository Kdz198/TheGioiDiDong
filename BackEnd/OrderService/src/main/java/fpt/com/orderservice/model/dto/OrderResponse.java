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
    Timestamp orderDate;
    OrderStatus status;
    int totalPrice;
    int basePrice;
    List<OrderDetail> orderDetails;
}

