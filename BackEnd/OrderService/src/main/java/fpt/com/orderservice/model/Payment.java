package fpt.com.orderservice.model;

import fpt.com.orderservice.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    @JoinColumn
    @ManyToOne
    Order order;
    String paymentMethod;
    //COD,PayOS
    int amount;
    Date date;
    PaymentStatus status;
}
