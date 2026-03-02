package tgdd.org.productservice.service;

import tgdd.org.productservice.model.ProductVersion;

import java.util.List;

public interface ProductVersionService {
    List<ProductVersion> findAll();
    ProductVersion findById(int id);
    ProductVersion save(ProductVersion productVersion);
    ProductVersion update( ProductVersion productVersion);
    void deleteById(int id);
}
