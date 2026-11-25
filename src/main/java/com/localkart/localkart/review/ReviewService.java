
package com.localkart.localkart.review;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.localkart.localkart.seller.SellerRepository;
import com.localkart.localkart.user.UserRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            SellerRepository sellerRepository) {

        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
    }

    // Add customer review
    public Review addReview(Review review) {

        if (!userRepository.existsById(review.getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Customer not found");
        }

        if (!sellerRepository.existsById(review.getSellerId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Seller not found");
        }

        if (review.getRating() == null ||
                review.getRating() < 1 ||
                review.getRating() > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5");
        }

        return reviewRepository.save(review);
    }

    // Get seller reviews
    public List<Review> getSellerReviews(Long sellerId) {

        if (!sellerRepository.existsById(sellerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Seller not found");
        }

        return reviewRepository.findBySellerId(sellerId);
    }

    // Calculate seller average rating
    public Double getSellerRating(Long sellerId) {

        if (!sellerRepository.existsById(sellerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Seller not found");
        }

        Double rating = reviewRepository.getAverageRating(sellerId);

        return rating == null ? 0.0 : rating;
    }
    public Double getSellerTrustScore(Long sellerId) {

    if (!sellerRepository.existsById(sellerId)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Seller not found");
    }

    Double averageRating = reviewRepository.getAverageRating(sellerId);

    if (averageRating == null) {
        return 0.0;
    }

    return Math.round((averageRating / 5.0) * 100.0 * 100.0) / 100.0;
}
}
