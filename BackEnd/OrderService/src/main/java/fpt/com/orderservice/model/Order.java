package fpt.com.orderservice.model;

import fpt.com.orderservice.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity(name = "orders")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    int userId;
    @CreationTimestamp
    Timestamp orderDate;
    OrderStatus status;
    int totalPrice;
    int basePrice;
    String orderCode;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "orderId", referencedColumnName = "id")
    List<OrderDetail> orderDetails ;
}
