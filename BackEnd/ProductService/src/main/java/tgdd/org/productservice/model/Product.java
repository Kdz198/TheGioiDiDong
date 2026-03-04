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
    @Column(columnDefinition = "TEXT")
    String name;
    @Column(columnDefinition = "TEXT")
    String description;
    int price;
    int quantity;
    int reserve;
    String imgUrl;
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
}
