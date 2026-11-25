
package com.localkart.localkart.seller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerRepository extends JpaRepository<seller, Long> {

    boolean existsByEmail(String email);

    List<seller> findByCityIgnoreCase(String city);

    List<seller> findByPostalCode(String postalCode);

    Optional<seller> findByUserId(Long userId);
}
