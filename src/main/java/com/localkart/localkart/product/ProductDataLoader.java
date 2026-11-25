
package com.localkart.localkart.product;

import com.localkart.localkart.seller.SellerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ProductDataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public ProductDataLoader(
            ProductRepository productRepository,
            SellerRepository sellerRepository) {
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
    }

    @Override
    public void run(String... args) {

        Long sellerId = 1L;

        if (!sellerRepository.existsById(sellerId)) {
            System.out.println("Seller ID 1 not found. Products not inserted.");
            return;
        }

        String[][] products = {
            {"Samsung Galaxy M35", "Samsung smartphone with 128GB storage", "15999", "Electronics", "25", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"},
            {"Apple iPhone 15", "Apple smartphone with advanced camera", "59999", "Electronics", "10", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"},
            {"Bluetooth Headphones", "Wireless over-ear headphones", "1499", "Electronics", "40", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"},
            {"Smart Watch", "Smart watch with fitness tracking", "2499", "Electronics", "30", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"},
            {"Laptop Backpack", "Water-resistant laptop backpack", "999", "Accessories", "35", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"},
            {"Wireless Mouse", "Ergonomic wireless computer mouse", "599", "Electronics", "50", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80"},
            {"Mechanical Keyboard", "RGB mechanical gaming keyboard", "1999", "Electronics", "20", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"},
            {"Power Bank", "10000mAh portable power bank", "1299", "Electronics", "30", "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80"},
            {"Men Cotton T-Shirt", "Comfortable cotton casual T-shirt", "599", "Clothing", "60", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"},
            {"Women Casual Dress", "Stylish casual everyday dress", "1299", "Clothing", "25", "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=600&q=80"},
            {"Men Running Shoes", "Lightweight running shoes", "1799", "Footwear", "30", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"},
            {"Women Sneakers", "Comfortable everyday sneakers", "1499", "Footwear", "25", "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"},
            {"Denim Jeans", "Classic blue denim jeans", "1199", "Clothing", "35", "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80"},
            {"School Backpack", "Spacious school and college backpack", "799", "Accessories", "40", "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=600&q=80"},
            {"Rice 5kg", "Premium quality rice", "399", "Grocery", "100", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"},
            {"Cooking Oil 1L", "Refined cooking oil", "145", "Grocery", "80", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80"},
            {"Organic Almonds", "Healthy premium almonds 500g", "499", "Grocery", "45", "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80"},
            {"Green Tea", "Refreshing green tea pack", "199", "Grocery", "50", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80"},
            {"Coffee Powder", "Fresh roasted coffee powder", "299", "Grocery", "40", "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80"},
            {"Electric Kettle", "1.5 litre electric kettle", "899", "Home Appliances", "20", "https://images.unsplash.com/photo-1594213114663-d94db9b1718e?auto=format&fit=crop&w=600&q=80"},
            {"Table Lamp", "Modern LED study table lamp", "699", "Home Decor", "25", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"},
            {"Wall Clock", "Modern decorative wall clock", "499", "Home Decor", "30", "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80"},
            {"Water Bottle", "Reusable stainless steel bottle", "399", "Accessories", "60", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"},
            {"Ceramic Coffee Mug", "Premium ceramic coffee mug", "249", "Home Decor", "50", "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80"},
            {"Programming in Java", "Beginner-friendly Java programming book", "599", "Books", "20", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80"},
            {"Python Programming Book", "Learn Python programming fundamentals", "499", "Books", "25", "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"},
            {"Football", "Standard size football", "799", "Sports", "20", "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80"},
            {"Yoga Mat", "Non-slip exercise and yoga mat", "699", "Sports", "30", "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=80"},
            {"Face Wash", "Daily gentle face cleanser", "199", "Beauty", "50", "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=600&q=80"},
            {"Sunglasses", "Stylish UV-protection sunglasses", "899", "Accessories", "25", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"}
        };

        Map<String, Product> existingProducts = new HashMap<>();

        List<Product> sellerProducts = productRepository.findBySellerId(sellerId);

        for (Product product : sellerProducts) {
            existingProducts.put(product.getName().toLowerCase(), product);
        }

        int inserted = 0;
        int updated = 0;

        for (String[] item : products) {

            String productName = item[0].toLowerCase();

            Product product = existingProducts.get(productName);

            if (product == null) {
                product = new Product();
                product.setName(item[0]);
                product.setDescription(item[1]);
                product.setPrice(Double.parseDouble(item[2]));
                product.setCategory(item[3]);
                product.setStock(Integer.parseInt(item[4]));
                product.setSellerId(sellerId);

                inserted++;
            } else {
                updated++;
            }

            product.setImageUrl(item[5]);

            productRepository.save(product);
        }

        System.out.println("LocalKart sample products inserted: " + inserted);
        System.out.println("LocalKart sample product images updated: " + updated);
    }
}
