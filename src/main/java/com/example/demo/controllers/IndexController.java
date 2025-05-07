package com.example.demo.controllers;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.NoHandlerFoundException;

@Controller
public class IndexController {
    // Forward all non-API, non-static requests to index.html for SPA routing
    @RequestMapping(value = {"/{path:^(?!api|assets|egresso-images|placeholder\\.png|vite\\.svg|index\\.html).*$}", "/{path:^(?!api|assets|egresso-images|placeholder\\.png|vite\\.svg|index\\.html).*$}/**"})
    public String forward() {
        return "forward:/index.html";
    }

    @CacheEvict(value = "first", allEntries = true)
    public void evictAllCacheValues() {}
}

