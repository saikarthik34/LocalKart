
package com.localkart.localkart.orders;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Place customer order
    @PostMapping("/place/{userId}")
    public ResponseEntity<List<Order>> placeOrder(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                orderService.placeOrder(userId));
    }

    // View customer's orders
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                orderService.getUserOrders(userId));
    }

    // View seller's orders
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Order>> getSellerOrders(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                orderService.getSellerOrders(sellerId));
    }

    // Update order status
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        orderId, request.get("status")));
    }
}
