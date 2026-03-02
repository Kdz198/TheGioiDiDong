package tgdd.org.productservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.model.Category;
import tgdd.org.productservice.repo.CategoryRepo;
import tgdd.org.productservice.service.CategoryService;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepo categoryRepo;

    @Override
    public List<Category> findAll() {
        return categoryRepo.findAll();
    }

    @Override
    public Category findById(int id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Override
    public Category save(Category category) {
        return categoryRepo.save(category);
    }

    @Override
    public Category update(Category category) {
       if(!categoryRepo.existsById(category.getId())) {
           throw new RuntimeException("Category not found with id: " + category.getId());
       }
         return categoryRepo.save(category);
    }

    @Override
    public void deleteById(int id) {
        categoryRepo.deleteById(id);
    }
}
