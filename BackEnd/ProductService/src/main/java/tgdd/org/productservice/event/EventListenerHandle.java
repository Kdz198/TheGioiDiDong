package tgdd.org.productservice.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import tgdd.org.productservice.model.dto.ProductEventDto;
import tgdd.org.productservice.repo.ProductRepo;
import tgdd.org.productservice.service.impl.CloudinaryService;

import java.io.IOException;
import java.util.Map;

@Component
public class EventListenerHandle {
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private CloudinaryService cloudinaryService;

    @Async
    @EventListener
    public void handleProductEvent(ProductEventDto productEventDto) throws IOException {
        Map<String,String> map = cloudinaryService.uploadImg(productEventDto.getImg());
        String url = map.get("secure_url");
        switch (productEventDto.getIndex()){
            case 1:
                productRepo.updateImgUrl1(productEventDto.getProduct().getId(), url);
                break;
            case 2:
                productRepo.updateImgUrl2(productEventDto.getProduct().getId(), url);
                break;
            case 3:
                productRepo.updateImgUrl3(productEventDto.getProduct().getId(), url);
                break;
            case 4:
                productRepo.updateImgUrl4(productEventDto.getProduct().getId(), url);
                break;
            case 5:
                productRepo.updateImgUrl5(productEventDto.getProduct().getId(), url);
                break;
             default:
                 System.out.println("Invalid index for product event: " + productEventDto.getIndex());
        }
    }
}
