
package com.localkart.localkart.cart;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Add product to cart
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(
            @RequestBody Map<String, Object> request) {

        Long userId = Long.valueOf(request.get("userId").toString());
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());

        Cart cart = cartService.addToCart(userId, productId, quantity);

        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    // View customer cart
    @GetMapping("/{userId}")
    public ResponseEntity<List<Cart>> getCart(
            @PathVariable Long userId) {

        return ResponseEntity.ok(cartService.getCart(userId));
    }

    // Remove product from cart
    @DeleteMapping("/{userId}/product/{productId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long productId) {

        cartService.removeFromCart(userId, productId);

        return ResponseEntity.noContent().build();
    }

    // Clear customer cart
    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Map<String, String>> clearCart(
            @PathVariable Long userId) {

        cartService.clearCart(userId);

        return ResponseEntity.ok(
                Map.of("message", "Cart cleared successfully"));
    }
}
