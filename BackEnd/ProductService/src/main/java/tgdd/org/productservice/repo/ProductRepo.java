package tgdd.org.productservice.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.productservice.model.*;
import java.util.*;

public interface ProductRepo extends JpaRepository<Product, Integer> {
    List<Product> findByBrandId(int brandId);
    List<Product> findByCategoryId(int categoryId);
    List<Product> findByActiveTrue();
    List<Product> findByActiveFalse();
    Product findById(int id);
}

