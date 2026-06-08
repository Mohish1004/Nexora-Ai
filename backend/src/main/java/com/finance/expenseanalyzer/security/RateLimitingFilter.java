package com.finance.expenseanalyzer.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class RateLimitingFilter implements Filter {

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private static final long TIME_WINDOW_MS = 60000L; // 1 minute

    private final ConcurrentHashMap<String, Queue<Long>> requestTimes = new ConcurrentHashMap<>();

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // init
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            String ip = getClientIP(httpRequest);
            
            Queue<Long> times = requestTimes.computeIfAbsent(ip, k -> new ConcurrentLinkedQueue<>());
            long now = System.currentTimeMillis();
            
            // Clean up old requests outside the sliding window
            while (!times.isEmpty() && now - times.peek() > TIME_WINDOW_MS) {
                times.poll();
            }
            
            if (times.size() >= MAX_REQUESTS_PER_MINUTE) {
                httpResponse.setStatus(429);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"message\": \"Too many requests. Please try again later.\"}");
                return;
            }
            
            times.add(now);
        }
        
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // destroy
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
