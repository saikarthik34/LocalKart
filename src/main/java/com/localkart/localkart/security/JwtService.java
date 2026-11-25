
package com.localkart.localkart.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.localkart.localkart.user.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {

        this.secretKey = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secret));

        this.expiration = expiration;
    }

    // Generate JWT token
    public String generateToken(User user) {

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey)
                .compact();
    }

    // Extract email from token
    public String extractUsername(String token) {

        return extractAllClaims(token).getSubject();
    }

    // Extract role from token
    public String extractRole(String token) {

        return extractAllClaims(token).get("role", String.class);
    }

    // Extract all token information
    public Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Validate token
    public boolean isTokenValid(String token, String email) {

        try {
            return extractUsername(token).equals(email)
                    && extractAllClaims(token)
                    .getExpiration()
                    .after(new Date());

        } catch (Exception e) {
            return false;
        }
    }
}
