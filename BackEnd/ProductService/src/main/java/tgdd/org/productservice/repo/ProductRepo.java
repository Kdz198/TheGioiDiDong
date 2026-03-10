package tgdd.org.productservice.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import tgdd.org.productservice.model.*;
import java.util.*;

public interface ProductRepo extends JpaRepository<Product, Integer> {
    List<Product> findByBrandId(int brandId);
    List<Product> findByCategoryId(int categoryId);
    List<Product> findByActiveTrue();
    List<Product> findByActiveFalse();
    Product findById(int id);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.imgUrl = :imgUrl WHERE p.id = :id")
    void updateImgUrl1(@Param("id") int id, @Param("imgUrl") String imgUrl);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.imgUrl2 = :imgUrl WHERE p.id = :id")
    void updateImgUrl2(@Param("id") int id, @Param("imgUrl") String imgUrl);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.imgUrl3 = :imgUrl WHERE p.id = :id")
    void updateImgUrl3(@Param("id") int id, @Param("imgUrl") String imgUrl);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.imgUrl4 = :imgUrl WHERE p.id = :id")
    void updateImgUrl4(@Param("id") int id, @Param("imgUrl") String imgUrl);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.imgUrl5 = :imgUrl WHERE p.id = :id")
    void updateImgUrl5(@Param("id") int id, @Param("imgUrl") String imgUrl);


}

