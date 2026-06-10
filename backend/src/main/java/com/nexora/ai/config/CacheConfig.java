package com.nexora.ai.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;

@Configuration
public class CacheConfig {

    private final RedisConnectionFactory redisConnectionFactory;

    public CacheConfig(ObjectProvider<RedisConnectionFactory> redisConnectionFactoryProvider) {
        this.redisConnectionFactory = redisConnectionFactoryProvider.getIfAvailable();
    }

    @Bean
    @Primary
    public CacheManager cacheManager() {
        if (redisConnectionFactory != null) {
            try {
                RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofMinutes(10)) // Default caching duration
                        .disableCachingNullValues();

                return RedisCacheManager.builder(redisConnectionFactory)
                        .cacheDefaults(config)
                        .build();
            } catch (Exception e) {
                // Connection/init failure fallback
            }
        }
        
        // Fallback local memory cache provider
        return new ConcurrentMapCacheManager("businessDashboard", "personalDashboard");
    }
}
