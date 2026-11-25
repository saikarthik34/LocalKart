
package com.localkart.localkart.product;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.localkart.localkart.seller.SellerService;
import com.localkart.localkart.seller.seller;
import com.localkart.localkart.user.User;
import com.localkart.localkart.user.UserService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final UserService userService;
    private final SellerService sellerService;

    public ProductController(
            ProductService productService,
            UserService userService,
            SellerService sellerService) {

        this.productService = productService;
        this.userService = userService;
        this.sellerService = sellerService;
    }

    // Get the store belonging to the authenticated seller
    private seller getAuthenticatedSeller(Authentication authentication) {

        User user = userService.getUserByEmail(authentication.getName());

        return sellerService.getSellerByUserId(user.getId());
    }

    // Add a product to the authenticated seller's store
    @PostMapping
    public ResponseEntity<Product> addProduct(
            @Valid @RequestBody Product product,
            Authentication authentication) {

        seller seller = getAuthenticatedSeller(authentication);

        product.setSellerId(seller.getId());

        Product savedProduct = productService.addProduct(product);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedProduct);
    }

    // Update only the authenticated seller's product
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product product,
            Authentication authentication) {

        seller seller = getAuthenticatedSeller(authentication);

        Product updatedProduct =
                productService.updateProduct(id, product, seller.getId());

        return ResponseEntity.ok(updatedProduct);
    }

    // Get all products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Get products by seller
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Product>> getProductsBySeller(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                productService.getProductsBySeller(sellerId));
    }

    // Search products by category
    @GetMapping("/category")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @RequestParam String category) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(category));
    }

    // Search products by name
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String name) {

        return ResponseEntity.ok(
                productService.searchProducts(name));
    }

    // Hide only the authenticated seller's product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {

        seller seller = getAuthenticatedSeller(authentication);

        productService.deleteProduct(id, seller.getId());

        return ResponseEntity.noContent().build();
    }
}
