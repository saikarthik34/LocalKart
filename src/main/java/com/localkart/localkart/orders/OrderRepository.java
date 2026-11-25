
package com.localkart.localkart.orders;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByStatus(String status);

    List<Order> findByProductIdIn(List<Long> productIds);
}
