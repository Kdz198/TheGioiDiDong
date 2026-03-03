package tgdd.org.productservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.model.Brand;
import tgdd.org.productservice.model.dto.BrandRequest;
import tgdd.org.productservice.repo.BrandRepo;
import tgdd.org.productservice.service.BrandService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class BrandServiceImpl implements BrandService {

    @Autowired
    private BrandRepo brandRepo;
    @Autowired
    private CloudinaryService cloudinaryService;

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
    public Brand save(BrandRequest brand) throws IOException {
        Map<String, String> map = cloudinaryService.uploadImg(brand.getFile());
        Brand newBrand = new Brand();
        newBrand.setName(brand.getName());
        newBrand.setLogoUrl(map.get("secure_url"));
        newBrand.setDescription(brand.getDescription());

        return brandRepo.save(newBrand);
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
