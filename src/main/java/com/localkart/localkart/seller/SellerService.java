
package com.localkart.localkart.seller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SellerService {

    private final SellerRepository sellerRepository;

    public SellerService(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    // Register a new seller
    public seller registerSeller(seller seller) {

        if (sellerRepository.existsByEmail(seller.getEmail())) {
            throw new IllegalArgumentException(
                    "Seller with this email already exists"
            );
        }

        return sellerRepository.save(seller);
    }

    // Get all sellers
    public List<seller> getAllSellers() {
        return sellerRepository.findAll();
    }

    // Get seller by ID
    public seller getSellerById(Long id) {
        return sellerRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Seller not found")
                );
    }

    // Find sellers by city
    public List<seller> getSellersByCity(String city) {
        return sellerRepository.findByCityIgnoreCase(city);
    }

    // Find sellers by postal code
    public List<seller> getSellersByPostalCode(String postalCode) {
        return sellerRepository.findByPostalCode(postalCode);
    }

    // Find store belonging to logged-in seller
    public seller getSellerByUserId(Long userId) {
        return sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No store is linked to this seller account"
                ));
    }
    
}
