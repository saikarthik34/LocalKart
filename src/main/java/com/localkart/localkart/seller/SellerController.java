
package com.localkart.localkart.seller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.localkart.localkart.product.ProductRepository;
import com.localkart.localkart.review.ReviewRepository;
import com.localkart.localkart.user.User;
import com.localkart.localkart.user.UserRepository;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerService sellerService;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public SellerController(
            SellerService sellerService,
            ProductRepository productRepository,
            ReviewRepository reviewRepository,
            UserRepository userRepository) {

        this.sellerService = sellerService;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
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

    // Seller dashboard - logged-in seller only
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getSellerDashboard(
            Authentication authentication) {

        User loggedInUser = userRepository.findByEmail(
                authentication.getName()
        ).orElseThrow(() ->
                new IllegalArgumentException("User not found"));

        seller sellerDetails =
                sellerService.getSellerByUserId(loggedInUser.getId());

        Long sellerId = sellerDetails.getId();

        int totalProducts =
                productRepository.findBySellerId(sellerId).size();

        long totalReviews =
                reviewRepository.countBySellerId(sellerId);

        Double averageRating =
                reviewRepository.getAverageRating(sellerId);

        Map<String, Object> dashboard = new LinkedHashMap<>();

        dashboard.put("seller", sellerDetails);
        dashboard.put("totalProducts", totalProducts);
        dashboard.put("totalReviews", totalReviews);
        dashboard.put("averageRating",
                averageRating == null ? 0.0 : averageRating);

        return ResponseEntity.ok(dashboard);
    }
}
