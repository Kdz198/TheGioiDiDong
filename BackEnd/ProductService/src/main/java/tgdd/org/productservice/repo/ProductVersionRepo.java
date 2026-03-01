package tgdd.org.productservice.repo;


import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.productservice.model.ProductVersion;

public interface ProductVersionRepo extends JpaRepository<ProductVersion, Integer> {
}
