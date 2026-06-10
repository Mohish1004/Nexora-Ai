package com.nexora.ai;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("local")
public class NexoraApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts up correctly without exceptions
    }
}
