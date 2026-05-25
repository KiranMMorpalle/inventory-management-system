package com.inventory.product.repository;

import com.inventory.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Search by category (case-insensitive)
    Page<Product> findByCategoryIgnoreCase(String category, Pageable pageable);

    // Search by product name (partial match)
    Page<Product> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);

    // Search by both name and category
    @Query("SELECT p FROM Product p WHERE " +
            "(:name IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:category IS NULL OR LOWER(p.category) = LOWER(:category))")
    Page<Product> searchProducts(@Param("name") String name,
                                 @Param("category") String category,
                                 Pageable pageable);
}