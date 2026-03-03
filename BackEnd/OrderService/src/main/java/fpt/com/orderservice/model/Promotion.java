package fpt.com.orderservice.model;

import fpt.com.orderservice.model.enums.PromotionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.sql.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    String code;
    String description;
    @Enumerated(EnumType.STRING)
    PromotionType type;

    //dùng cho money hoặc percentage( nếu là percentage thì discount là số phần trăm, nếu money thì discount là số tiền giảm)
    int discountValue;
    int maxDiscountValue; // giá trị giảm tối đa (chỉ áp dụng cho percentage)
    int minOrderAmount;// giá trị đơn hàng tối thiểu để áp dụng khuyến mãi
    Date startDate;
    Date endDate;
    boolean active;
    int quantity;
}
