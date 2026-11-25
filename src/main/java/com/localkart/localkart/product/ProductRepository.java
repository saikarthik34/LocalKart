
package com.localkart.localkart.product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findBySellerId(Long sellerId);

    List<Product> findBySellerIdAndActiveTrue(Long sellerId);

    List<Product> findByCategoryIgnoreCaseAndActiveTrue(String category);

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);

    boolean existsByNameIgnoreCaseAndSellerId(String name, Long sellerId);
}
