package com.booktracker.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI bookTrackerOpenAPI() {
        Server server = new Server();
        server.setUrl("http://localhost:8080");
        server.setDescription("Development Server");

        Contact contact = new Contact();
        contact.setEmail("support@booktracker.com");
        contact.setName("BookTracker Support");

        // Настройка безопасности для JWT
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        Info info = new Info()
                .title("BookTracker API")
                .version("1.0.0")
                .contact(contact)
                .description("REST API for BookTracker - Personal Library Management System");

        return new OpenAPI()
                .info(info)
                .servers(List.of(server))
                .components(new Components().addSecuritySchemes("bearerAuth", securityScheme));
    }
}