package com.thechair.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thechair.common.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // Run first to block brute force before Spring Security overhead
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 5;
    private static final long TIME_WINDOW_MS = 60000L; // 1 minute
    
    // Thread-safe map tracking request timestamps by client IP
    private final Map<String, List<Long>> requestHistory = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Target high-risk authentication endpoints
        if (isAuthEndpoint(path)) {
            String ipAddress = getClientIp(request);
            long now = System.currentTimeMillis();

            List<Long> timestamps = requestHistory.computeIfAbsent(ipAddress, k -> Collections.synchronizedList(new ArrayList<>()));

            synchronized (timestamps) {
                // Remove timestamps older than the 1-minute window
                timestamps.removeIf(time -> (now - time) > TIME_WINDOW_MS);

                if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
                    log.warn("Rate limit exceeded for IP: {} on path: {}. Request count: {}", ipAddress, path, timestamps.size());
                    sendErrorResponse(response, "Too many requests. Please wait 1 minute before trying again.");
                    return;
                }

                // Record current request timestamp
                timestamps.add(now);
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAuthEndpoint(String path) {
        return path.startsWith("/api/v1/auth/login") ||
               path.startsWith("/api/v1/auth/register") ||
               path.startsWith("/api/v1/auth/verify-otp") ||
               path.startsWith("/api/v1/auth/resend-otp");
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429); // Too Many Requests
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        ApiResponse<?> errorResponse = ApiResponse.error(message);
        String json = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(json);
    }
}
