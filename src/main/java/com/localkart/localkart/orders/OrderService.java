
package com.localkart.localkart.orders;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.localkart.localkart.cart.Cart;
import com.localkart.localkart.cart.CartRepository;
import com.localkart.localkart.product.Product;
import com.localkart.localkart.product.ProductRepository;
import com.localkart.localkart.seller.SellerRepository;
import com.localkart.localkart.user.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            SellerRepository sellerRepository) {

        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
    }

    // Place order using customer's cart
    @Transactional
    public List<Order> placeOrder(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "User not found");
        }

        List<Cart> cartItems = cartRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        List<Order> orders = cartItems.stream().map(item -> {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Product not found"));

            if (product.getStock() < item.getQuantity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getName());
            }

            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);

            Order order = new Order();
            order.setUserId(userId);
            order.setProductId(product.getId());
            order.setQuantity(item.getQuantity());
            order.setTotalPrice(product.getPrice() * item.getQuantity());
            order.setStatus("PENDING");

            return orderRepository.save(order);

        }).toList();

        cartRepository.deleteByUserId(userId);

        return orders;
    }

    // View customer's orders
    public List<Order> getUserOrders(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "User not found");
        }

        return orderRepository.findByUserId(userId);
    }

    // View orders received by a seller
    public List<Order> getSellerOrders(Long sellerId) {

        if (!sellerRepository.existsById(sellerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Seller not found");
        }

        List<Long> productIds = productRepository.findBySellerId(sellerId)
                .stream()
                .map(Product::getId)
                .toList();

        if (productIds.isEmpty()) {
            return List.of();
        }

        return orderRepository.findByProductIdIn(productIds);
    }

    // Update order status
    public Order updateOrderStatus(Long orderId, String status) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        if (status == null ||
                !List.of("CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED")
                        .contains(status.toUpperCase())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid order status");
        }

        order.setStatus(status.toUpperCase());

        return orderRepository.save(order);
    }
}
