package tgdd.org.productservice.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.hibernate.type.descriptor.jdbc.SqlTypedJdbcType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    @Column(columnDefinition = "TEXT")
    String name;
    @Column(columnDefinition = "TEXT")
    String description;
    int price;
    int quantity;
    int reserve;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    List<String> imgUrls = new ArrayList<>();
    boolean active;
    @JoinColumn
    @ManyToOne
    ProductVersion version;
    @JoinColumn
    @ManyToOne
    Brand brand;
    @JoinColumn
    @ManyToOne
    Category category;
    boolean type;//true: product,false: dịch vụ
    @CreationTimestamp
    LocalDateTime createdAt;
}
