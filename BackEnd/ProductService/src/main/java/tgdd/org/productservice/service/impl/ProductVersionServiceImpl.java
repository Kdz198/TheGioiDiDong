package tgdd.org.productservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.model.ProductVersion;
import tgdd.org.productservice.repo.ProductVersionRepo;
import tgdd.org.productservice.service.ProductVersionService;

import java.util.List;

@Service
public class ProductVersionServiceImpl implements ProductVersionService {

    @Autowired
    private ProductVersionRepo productVersionRepo;

    @Override
    public List<ProductVersion> findAll() {
        return productVersionRepo.findAll();
    }

    @Override
    public ProductVersion findById(int id) {
        return productVersionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductVersion not found with id: " + id));
    }

    @Override
    public ProductVersion save(ProductVersion productVersion) {
        return productVersionRepo.save(productVersion);
    }

    @Override
    public ProductVersion update(ProductVersion productVersion) {

        if(!productVersionRepo.existsById(productVersion.getId())) {
            throw new RuntimeException("ProductVersion not found with id: " + productVersion.getId());
        }
        return productVersionRepo.save(productVersion);
    }

    @Override
    public void deleteById(int id) {
        productVersionRepo.deleteById(id);
    }
}
