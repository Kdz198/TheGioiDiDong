package tgdd.org.productservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tgdd.org.productservice.model.dto.request.CreateBlogRequest;
import tgdd.org.productservice.model.dto.response.RetrieveBlogResponse;
import tgdd.org.productservice.service.BlogService;

@RestController
@RequestMapping("api/products/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    @GetMapping
    public Page<RetrieveBlogResponse> getBlogs(Pageable pageable) {
        return blogService.getBlogs(pageable);
    }

    @PostMapping
    public void createBlog(@RequestBody CreateBlogRequest request) {
        blogService.createBlog(request);
    }

    @PutMapping("/{id}")
    public void updateBlog(@PathVariable long id, @RequestBody CreateBlogRequest request) {
        blogService.updateBlog(id, request);
    }

}
