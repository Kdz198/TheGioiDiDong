package tgdd.org.productservice.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.productservice.model.Product;

public interface ProductRepo extends JpaRepository<Product, Integer> {
}
