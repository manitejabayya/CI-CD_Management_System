package com.maniteja.cicdplatform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class JenkinsConfig {

    @Value("${jenkins.url}")
    private String jenkinsUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}