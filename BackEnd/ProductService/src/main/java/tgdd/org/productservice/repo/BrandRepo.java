package tgdd.org.productservice.repo;


import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.productservice.model.Brand;

public interface BrandRepo extends JpaRepository<Brand, Integer> {
}
