package tgdd.org.productservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import tgdd.org.productservice.model.dto.request.CreateBlogRequest;
import tgdd.org.productservice.model.dto.response.RetrieveBlogResponse;

public interface BlogService {

    void createBlog(CreateBlogRequest request);

    void updateBlog(long id, CreateBlogRequest request);

    Page<RetrieveBlogResponse> getBlogs(Pageable pageable);

    String uploadImg ( MultipartFile file);
}
