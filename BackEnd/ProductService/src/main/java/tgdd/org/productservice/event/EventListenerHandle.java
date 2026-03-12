package tgdd.org.productservice.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import tgdd.org.productservice.model.Product;
import tgdd.org.productservice.model.dto.ProductEventDto;
import tgdd.org.productservice.repo.ProductRepo;
import tgdd.org.productservice.service.impl.CloudinaryService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class EventListenerHandle {
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private CloudinaryService cloudinaryService;


    @EventListener
    public void handleProductEvent(ProductEventDto dto) throws IOException {
        List<String> uploadResult = new ArrayList<>();
        for (MultipartFile file : dto.getMultipartFiles()) {
            if (file != null && !file.isEmpty()) {
                Map<String, String> map = cloudinaryService.uploadImg(file);
                uploadResult.add(map.get("secure_url"));
            } else {
                uploadResult.add(null);
            }
        }
        Product product = productRepo.findById(dto.getProductId());

        if (dto.getMessage().equals("CREATE")) {
            System.out.println("CREATE");
            product.setImgUrls(uploadResult);
        } else {
            System.out.println("UPDATE");
                    List<String> oldUrl = product.getImgUrls();
            for (int i = 0; i < uploadResult.size(); i++) {
                if (uploadResult.get(i) != null) {
                    oldUrl.set(i, uploadResult.get(i));
                }
            }
        }
        productRepo.save(product);

    }
}
