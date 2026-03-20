package tgdd.org.productservice.model.dto.response;

import lombok.Builder;
import lombok.Data;
import tgdd.org.productservice.model.Blog;

import java.time.LocalDateTime;

@Data
@Builder
public class RetrieveBlogResponse {
    long id;
    String title;
    String author;
    String summary;
    String content;
    String thumbnailUrl;
    LocalDateTime createdAt;
    Blog.BlogStatus status;
}
