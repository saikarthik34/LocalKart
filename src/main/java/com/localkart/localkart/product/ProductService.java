
package com.localkart.localkart.product;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.localkart.localkart.seller.SellerRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public ProductService(
            ProductRepository productRepository,
            SellerRepository sellerRepository) {

        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
    }

    // Add product
    public Product addProduct(Product product) {

        if (!sellerRepository.existsById(product.getSellerId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Seller not found"
            );
        }

        product.setActive(true);

        return productRepository.save(product);
    }

    // Get all active products
    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    // Get product by ID
    public Product getProductById(Long id) {

        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));
    }

    // Get products by seller
    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerIdAndActiveTrue(sellerId);
    }

    // Get products by category
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCaseAndActiveTrue(category);
    }

    // Search products
    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(name);
    }

    // Update product with ownership verification
    public Product updateProduct(
            Long id,
            Product updatedProduct,
            Long authenticatedSellerId) {

        Product existingProduct = getProductById(id);

        if (!existingProduct.getSellerId().equals(authenticatedSellerId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot update another seller's product"
            );
        }

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStock(updatedProduct.getStock());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());

        return productRepository.save(existingProduct);
    }

    // Delete product with ownership verification
    public void deleteProduct(
            Long id,
            Long authenticatedSellerId) {

        Product product = getProductById(id);

        if (!product.getSellerId().equals(authenticatedSellerId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot delete another seller's product"
            );
        }

        product.setActive(false);

        productRepository.save(product);
    }
}
