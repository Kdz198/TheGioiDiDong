package tgdd.org.productservice.service.impl;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tgdd.org.productservice.config.Producer;
import tgdd.org.productservice.exception.CustomException;
import tgdd.org.productservice.mapper.ProductMapper;
import tgdd.org.productservice.model.*;
import tgdd.org.productservice.model.dto.*;
import tgdd.org.productservice.repo.*;
import tgdd.org.productservice.service.ProductService;

import java.io.IOException;
import java.util.*;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private BrandRepo brandRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private ProductVersionRepo productVersionRepo;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private Producer producer;
    @Autowired
    private OrderReserveRepo orderReserveRepo;

    @Override
    public List<ProductResponse> findAll() {
        return productMapper.toProductResponseList(productRepo.findAll());
    }

    @Override
    public ProductResponse findById(int id) {
        Product product = productRepo.findById(id);
        if (product == null) {
            throw new CustomException("Product not found with id: " + id,HttpStatus.NOT_FOUND);
        }
        return productMapper.toProductResponse(product);
    }

    @Override
    public ProductResponse save(ProductRequest productRequest) throws IOException {
        String imgUrl = null;
        Map<String, String> uploadResult = cloudinaryService.uploadImg(productRequest.getImg());
        imgUrl = uploadResult.get("secure_url");

        Brand brand = brandRepo.findById(productRequest.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + productRequest.getBrandId()));
        Category category = categoryRepo.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productRequest.getCategoryId()));
        ProductVersion version = productVersionRepo.findById(productRequest.getVersionId())
                .orElseThrow(() -> new RuntimeException("ProductVersion not found with id: " + productRequest.getVersionId()));
        Product product = productMapper.toProduct(productRequest);
        product.setVersion(version);
        product.setBrand(brand);
        product.setCategory(category);
        product.setImgUrl(imgUrl);
        product.setQuantity(productRequest.getStockQuantity());

        Product saved = productRepo.save(product);
        return productMapper.toProductResponse(saved);
    }


    @Override
    public ProductResponse update(ProductUpdateRequest request) throws IOException {
        System.out.println("Updating product with id: " + request.getId());
        Product existingProduct = productRepo.findById(request.getId());
        if (existingProduct == null) {
            throw new CustomException("Product not found ",HttpStatus.NOT_FOUND);
        }
        String imgUrl = existingProduct.getImgUrl();
        if (request.getImg() != null && !request.getImg().isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadImg(request.getImg());
            imgUrl = uploadResult.get("secure_url");
        }
        Brand brand = brandRepo.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + request.getBrandId()));

        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        ProductVersion version = productVersionRepo.findById(request.getVersionId())
                .orElseThrow(() -> new RuntimeException("ProductVersion not found with id: " + request.getVersionId()));


        productMapper.updateProductFromRequest(request, existingProduct);
        existingProduct.setVersion(version);
        existingProduct.setBrand(brand);
        existingProduct.setCategory(category);
        existingProduct.setImgUrl(imgUrl);
        existingProduct.setActive(request.getActive());
        existingProduct.setQuantity(request.getStockQuantity());
        System.out.println(existingProduct.isActive());
        Product updated = productRepo.save(existingProduct);
        return productMapper.toProductResponse(updated);
    }

    @Override
    public void deleteById(int id) {
        productRepo.deleteById(id);
    }

    @Override
    public List<ProductResponse> findByBrandId(int brandId) {
        return productMapper.toProductResponseList(productRepo.findByBrandId(brandId));
    }

    @Override
    public List<ProductResponse> findByCategoryId(int categoryId) {
        return productMapper.toProductResponseList(productRepo.findByCategoryId(categoryId));
    }

    @Override
    public List<ProductResponse> findActiveProducts() {
        return productMapper.toProductResponseList(productRepo.findByActiveTrue());
    }

    @Override
    public List<ProductResponse> findInactiveProducts() {
        return productMapper.toProductResponseList(productRepo.findByActiveFalse());
    }

    @Override
    public OrderRequest isStockAvailable(OrderRequest request) {
        Map<Integer,Integer> productQuantities = new HashMap<>();
        for(OrderRequest.OrderDetailRequest item : request.getOrderDetails()) {
            productQuantities.put(item.getProductId(), productQuantities.getOrDefault(item.getProductId(), 0) + item.getQuantity());
        }
        List<Product> products = productRepo.findAllById(productQuantities.keySet());
        if (products.size() != productQuantities.keySet().size()) {
            throw new CustomException("Out of stock", HttpStatus.CONFLICT);
        }
        for (Product product : products) {
            int requiredQuantity = productQuantities.get(product.getId());
            int availableStock = product.getQuantity() - product.getReserve();

            if (!product.isActive() || availableStock < requiredQuantity) {
                throw new CustomException("Out of stock", HttpStatus.CONFLICT);
            }
            product.setReserve(product.getReserve() + requiredQuantity);
        }
        request.setOrderCode(UUID.randomUUID().toString());
        productRepo.saveAll(products);
        producer.publishOrderAvailable(request);
        saveItem(request);
        return request;
    }

    @Transactional
    @Override
    public void deductStock(String orderCode) {
        OrderReserve orderReserve = orderReserveRepo.findByOrderCode(orderCode);
        if (orderReserve != null) {
            List<Item> items = orderReserve.getItem();
            Map<Integer, Integer> quantityMap = new HashMap<>();
            for (Item item : items) {
                quantityMap.put(item.getProductId(), item.getQuantity());
            }
            List<Product> products = productRepo.findAllById(quantityMap.keySet());
            for (Product product : products) {
                int qty = quantityMap.get(product.getId());
                product.setReserve(product.getReserve() - qty);
                product.setQuantity(product.getQuantity() - qty);
            }
            productRepo.saveAll(products);
            orderReserveRepo.delete(orderReserve);
        }
    }

    @Transactional
    @Override
    public void restoreStock(String orderCode) {
        OrderReserve orderReserve = orderReserveRepo.findByOrderCode(orderCode);
        if (orderReserve != null) {
            List<Item> items = orderReserve.getItem();
            Map<Integer, Integer> quantityMap = new HashMap<>();
            for (Item item : items) {
                quantityMap.put(item.getProductId(), item.getQuantity());
            }
            List<Product> products = productRepo.findAllById(quantityMap.keySet());
            for (Product product : products) {
                int qty = quantityMap.get(product.getId());
                product.setReserve(product.getReserve() - qty);
            }
            productRepo.saveAll(products);
            orderReserveRepo.delete(orderReserve);
        }
    }

    private void saveItem(OrderRequest request) {
        Map<Integer,Integer> productQuantities = new HashMap<>();
        for(OrderRequest.OrderDetailRequest item : request.getOrderDetails()) {
            productQuantities.put(item.getProductId(), productQuantities.getOrDefault(item.getProductId(), 0) + item.getQuantity());
        }
        List<Item> items = new ArrayList<>();
        for(Map.Entry<Integer, Integer> entry : productQuantities.entrySet()) {
            Item item = new Item();
            item.setProductId(entry.getKey());
            item.setQuantity(entry.getValue());
            items.add(item);
        }
        OrderReserve orderReserve = new OrderReserve(request.getOrderCode(), items);
        orderReserveRepo.save(orderReserve);
    }

}
