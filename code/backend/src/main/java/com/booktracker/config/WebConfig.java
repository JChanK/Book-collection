package com.booktracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Перенаправление с корня на Swagger UI
        registry.addRedirectViewController("/", "/swagger-ui.html");
        registry.addRedirectViewController("", "/swagger-ui.html");
        registry.addRedirectViewController("/swagger-ui", "/swagger-ui.html");
    }
}