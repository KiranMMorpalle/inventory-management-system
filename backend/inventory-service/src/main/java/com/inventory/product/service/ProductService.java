package com.inventory.product.service;

import com.inventory.product.dto.ProductRequest;
import com.inventory.product.dto.ProductResponse;
import com.inventory.product.entity.Product;
import com.inventory.product.exception.ProductNotFoundException;
import com.inventory.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    // ─── Create ────────────────────────────────────────────────

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .productName(request.getProductName())
                .category(request.getCategory())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .build();

        Product saved = productRepository.save(product);
        log.info("Product created: {}", saved.getProductName());
        return mapToResponse(saved);
    }

    // ─── Read All (paginated + optional filters) ───────────────

    @Cacheable(value = "products", key = "#page + '-' + #size + '-' + #sortBy + '-' + #name + '-' + #category")
    public Page<ProductResponse> getAllProducts(int page, int size, String sortBy,
                                                String name, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());

        Page<Product> products = productRepository.searchProducts(name, category, pageable);
        log.debug("Fetched products from DB - page: {}, size: {}", page, size);
        return products.map(this::mapToResponse);
    }

    // ─── Read One ──────────────────────────────────────────────

    @Cacheable(value = "product", key = "#id")
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        log.debug("Fetched product by id: {}", id);
        return mapToResponse(product);
    }

    // ─── Update ────────────────────────────────────────────────

    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        product.setProductName(request.getProductName());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());

        Product updated = productRepository.save(product);
        log.info("Product updated: {}", updated.getId());
        return mapToResponse(updated);
    }

    // ─── Delete ────────────────────────────────────────────────

    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Product deleted: {}", id);
    }

    // ─── Stock check (used by Order Service) ──────────────────

    public boolean isStockAvailable(Long productId, int requestedQty) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));
        return product.getQuantity() >= requestedQty;
    }

    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void reduceStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));

        if (product.getQuantity() < quantity) {
            throw new com.inventory.product.exception.InsufficientStockException(
                    "Insufficient stock for product: " + product.getProductName());
        }

        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);
        log.info("Stock reduced for product: {} by {}", productId, quantity);
    }

    // ─── Mapper ────────────────────────────────────────────────

    private ProductResponse mapToResponse(Product product) {
        String stockStatus;
        if (product.getQuantity() == 0) stockStatus = "OUT_OF_STOCK";
        else if (product.getQuantity() <= 10) stockStatus = "LOW_STOCK";
        else stockStatus = "IN_STOCK";

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .category(product.getCategory())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .stockStatus(stockStatus)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}