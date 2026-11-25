
package com.localkart.localkart.review;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @Valid @RequestBody Review review) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addReview(review));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Review>> getSellerReviews(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                reviewService.getSellerReviews(sellerId));
    }

    @GetMapping("/seller/{sellerId}/rating")
    public ResponseEntity<Double> getSellerRating(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                reviewService.getSellerRating(sellerId));
    }

    @GetMapping("/seller/{sellerId}/trust-score")
    public ResponseEntity<Double> getSellerTrustScore(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                reviewService.getSellerTrustScore(sellerId));
    }
}
