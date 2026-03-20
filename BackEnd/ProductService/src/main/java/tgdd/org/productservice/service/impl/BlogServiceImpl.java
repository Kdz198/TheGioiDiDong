package tgdd.org.productservice.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tgdd.org.productservice.model.Blog;
import tgdd.org.productservice.model.UserClaims;
import tgdd.org.productservice.model.dto.request.CreateBlogRequest;
import tgdd.org.productservice.model.dto.response.RetrieveBlogResponse;
import tgdd.org.productservice.repo.BlogRepository;
import tgdd.org.productservice.service.BlogService;
import tgdd.org.productservice.util.SecurityUtil;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final ObjectMapper objectMapper;
    private final SecurityUtil securityUtil;
    private final CloudinaryService cloudinaryService;


    @Override
    public void createBlog(CreateBlogRequest request) {
        UserClaims currentUser;
        try {
            currentUser = securityUtil.getCurrentUser();
        } catch (Exception e) {
            currentUser = new UserClaims(" system@gmail.com", -1L, "SYSTEM", List.of());
        }

        Blog blog = Blog.builder()
                .title(request.getTitle())
                .author(currentUser.getEmail())
                .summary(request.getSummary())
                .content(request.getContent())
                .thumbnailUrl(request.getThumbnailUrl())
                .status(Blog.BlogStatus.DRAFT)
                .build();

        blogRepository.save(blog);
    }

    @Override
    public void updateBlog(long id, CreateBlogRequest request) {

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id: " + id));

        blog.setTitle(request.getTitle());
        blog.setSummary(request.getSummary());
        blog.setContent(request.getContent());
        blog.setThumbnailUrl(request.getThumbnailUrl());

        blogRepository.save(blog);

    }

    @Override
    public Page<RetrieveBlogResponse> getBlogs(Pageable pageable) {
        return blogRepository.findAll(pageable)
                .map(blog -> objectMapper.convertValue(blog, RetrieveBlogResponse.class));

    }

}
