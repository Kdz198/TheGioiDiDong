package tgdd.org.productservice.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    String name;
    String description;
    int price;
    int stockQuantity;
    String imgUrl;
    boolean isActive;
    @JoinColumn
    @ManyToOne
    ProductVersion version;
    @JoinColumn
    @ManyToOne
    Brand brand;
    @JoinColumn
    @ManyToOne
    Category category;
}
