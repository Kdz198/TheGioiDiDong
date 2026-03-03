package tgdd.org.productservice.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {
    @Autowired
    private Cloudinary cloudinary;

    public Map<String,String> uploadImg(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "my_app/images",
                "resource_type", "image",
                "allowed_formats", new String[]{"jpg", "jpeg", "png", "gif", "webp"}));
        String public_id = (String) uploadResult.get("public_id");
        String secure_url = uploadResult.get("secure_url").toString();
        Map<String,String> result = new HashMap<String,String>();
        result.put("public_id",public_id);
        result.put("secure_url",secure_url);

        return result;
    }

    public Map deleteImage(String publicId) throws IOException {
        Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate",true));
        //có thể xóa cache CDN hoặc ko ( thường thì sẽ bị mất sau 1 thời giannn vài phút - vài giờ
        return result;
    }

    public boolean validate(MultipartFile file){
        String fileName = file.getOriginalFilename();
        String contentType = file.getContentType();
        System.out.println(contentType);
        System.out.println(fileName);

        if(contentType == null || !contentType.startsWith("image/")){
            return false;
        }

        if(fileName == null || !fileName.toLowerCase().matches(".*\\.(jpg|jpeg|png|gif|webp)$")){
            return false;
        }
        return true;
    }

}
