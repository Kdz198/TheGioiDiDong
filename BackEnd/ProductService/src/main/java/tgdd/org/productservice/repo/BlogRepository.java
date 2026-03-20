package tgdd.org.productservice.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.productservice.model.Blog;

public interface BlogRepository extends JpaRepository<Blog, Long> {
}
