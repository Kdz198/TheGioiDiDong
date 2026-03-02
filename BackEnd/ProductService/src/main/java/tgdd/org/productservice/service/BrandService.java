package tgdd.org.productservice.service;

import tgdd.org.productservice.model.Brand;

import java.util.List;

public interface BrandService {
    List<Brand> findAll();
    Brand findById(int id);
    Brand save(Brand brand);
    Brand update( Brand brand);
    void deleteById(int id);
}
