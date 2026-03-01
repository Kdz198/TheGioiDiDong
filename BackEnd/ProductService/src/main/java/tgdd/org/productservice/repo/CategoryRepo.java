package tgdd.org.productservice.repo;


import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.productservice.model.Category;

public interface CategoryRepo extends JpaRepository<Category, Integer> {
}
