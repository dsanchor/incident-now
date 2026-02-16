package com.incidentnow.config;

import com.incidentnow.model.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToIncidentStatusConverter());
        registry.addConverter(new StringToPriorityConverter());
        registry.addConverter(new StringToSeverityConverter());
        registry.addConverter(new StringToIncidentCategoryConverter());
        registry.addConverter(new StringToOwnerRoleConverter());
    }

    static class StringToIncidentStatusConverter implements Converter<String, IncidentStatus> {
        @Override
        public IncidentStatus convert(String source) {
            return IncidentStatus.fromValue(source);
        }
    }

    static class StringToPriorityConverter implements Converter<String, Priority> {
        @Override
        public Priority convert(String source) {
            return Priority.fromValue(source);
        }
    }

    static class StringToSeverityConverter implements Converter<String, Severity> {
        @Override
        public Severity convert(String source) {
            return Severity.fromValue(source);
        }
    }

    static class StringToIncidentCategoryConverter implements Converter<String, IncidentCategory> {
        @Override
        public IncidentCategory convert(String source) {
            return IncidentCategory.fromValue(source);
        }
    }

    static class StringToOwnerRoleConverter implements Converter<String, OwnerRole> {
        @Override
        public OwnerRole convert(String source) {
            return OwnerRole.fromValue(source);
        }
    }
}
