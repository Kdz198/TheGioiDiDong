package fpt.com.orderservice.model;

import fpt.com.orderservice.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity(name = "orders")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    int id;
    int userId;
    @CreationTimestamp
    LocalDateTime orderDate;
    OrderStatus status;
    int totalPrice;
    int basePrice;
    String orderCode;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "orderId", referencedColumnName = "id")
    List<OrderDetail> orderDetails;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    List<OrderInfo> orderInfo ;
    String note;

    @Data
    public static class OrderInfo {
        String phoneNumber;
        String address;
        String recipientName;
    }
}
