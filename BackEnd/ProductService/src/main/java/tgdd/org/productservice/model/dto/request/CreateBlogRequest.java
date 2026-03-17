package tgdd.org.productservice.model.dto.request;

import lombok.Data;

@Data
public class CreateBlogRequest {
    String title;
    String summary;
    String content;
    String thumbnailUrl;
}
