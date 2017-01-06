package org.demoiselle.jee7.example.compiler.service;

import io.swagger.jaxrs.config.BeanConfig;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("api/v1")
public class ApplicationConfig extends Application {

        public ApplicationConfig() {
        BeanConfig beanConfig = new BeanConfig();
        beanConfig.setVersion("1.8.0");
        beanConfig.setBasePath("/compiler/api/v1");
        beanConfig.setResourcePackage("org.demoiselle.jee7.example.compiler.service");
        beanConfig.setScan(true);
    }
}
