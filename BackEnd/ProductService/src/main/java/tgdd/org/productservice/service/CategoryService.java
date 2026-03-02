package tgdd.org.productservice.service;

import tgdd.org.productservice.model.Category;

import java.util.List;

public interface CategoryService {
    List<Category> findAll();
    Category findById(int id);
    Category save(Category category);
    Category update(Category category);
    void deleteById(int id);
}
