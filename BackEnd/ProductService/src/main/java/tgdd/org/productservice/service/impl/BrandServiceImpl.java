package tgdd.org.productservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.model.Brand;
import tgdd.org.productservice.repo.BrandRepo;
import tgdd.org.productservice.service.BrandService;

import java.util.List;

@Service
public class BrandServiceImpl implements BrandService {

    @Autowired
    private BrandRepo brandRepo;

    @Override
    public List<Brand> findAll() {
        return brandRepo.findAll();
    }

    @Override
    public Brand findById(int id) {
        return brandRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
    }

    @Override
    public Brand save(Brand brand) {
        return brandRepo.save(brand);
    }

    @Override
    public Brand update( Brand brand) {
      if(!brandRepo.existsById(brand.getId())) {
          throw new RuntimeException("Brand not found with id: " + brand.getId());
      }
        return brandRepo.save(brand);

    }

    @Override
    public void deleteById(int id) {
        brandRepo.deleteById(id);
    }
}
