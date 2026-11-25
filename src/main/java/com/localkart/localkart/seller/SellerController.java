
package com.localkart.localkart.seller;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.localkart.localkart.product.ProductRepository;
import com.localkart.localkart.review.ReviewRepository;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerService sellerService;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public SellerController(
            SellerService sellerService,
            ProductRepository productRepository,
            ReviewRepository reviewRepository) {

        this.sellerService = sellerService;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    // Register a new seller
    @PostMapping
    public ResponseEntity<seller> registerSeller(
            @RequestBody seller seller) {

        seller savedSeller = sellerService.registerSeller(seller);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedSeller);
    }

    // Get all sellers
    @GetMapping
    public ResponseEntity<List<seller>> getAllSellers() {
        return ResponseEntity.ok(sellerService.getAllSellers());
    }

    // Get seller by ID
    @GetMapping("/{id}")
    public ResponseEntity<seller> getSellerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(sellerService.getSellerById(id));
    }

    // Find sellers by city
    @GetMapping("/search")
    public ResponseEntity<List<seller>> getSellersByCity(
            @RequestParam String city) {

        return ResponseEntity.ok(
                sellerService.getSellersByCity(city));
    }

    // Find sellers by postal code
    @GetMapping("/search/postal-code")
    public ResponseEntity<List<seller>> getSellersByPostalCode(
            @RequestParam String postalCode) {

        return ResponseEntity.ok(
                sellerService.getSellersByPostalCode(postalCode));
    }

    // Seller dashboard
    @GetMapping("/{id}/dashboard")
    public ResponseEntity<Map<String, Object>> getSellerDashboard(
            @PathVariable Long id) {

        seller sellerDetails = sellerService.getSellerById(id);

        int totalProducts =
                productRepository.findBySellerId(id).size();

        long totalReviews =
                reviewRepository.countBySellerId(id);

        Double averageRating =
                reviewRepository.getAverageRating(id);

        Map<String, Object> dashboard = new LinkedHashMap<>();

        dashboard.put("seller", sellerDetails);
        dashboard.put("totalProducts", totalProducts);
        dashboard.put("totalReviews", totalReviews);
        dashboard.put("averageRating",
                averageRating == null ? 0.0 : averageRating);

        return ResponseEntity.ok(dashboard);
    }
}
