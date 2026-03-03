package tgdd.org.productservice.service;

import tgdd.org.productservice.model.Brand;
import tgdd.org.productservice.model.dto.BrandRequest;

import java.io.IOException;
import java.util.List;

public interface BrandService {
    List<Brand> findAll();
    Brand findById(int id);
    Brand save(BrandRequest brand) throws IOException;
    Brand update( Brand brand);
    void deleteById(int id);
}
