package com.example.demo.controllers;

import java.util.Map;

import org.json.JSONObject;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
public class ApiController {
    @GetMapping("/api/v1/")
	public ResponseEntity<String> index(@RequestHeader Map<String, String> headers) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Content-Type", "application/json");

        JSONObject jo = new JSONObject();

        jo.put("name", "jon doe");
        jo.put("age", "22");
        jo.put("city", "chicago");

        return new ResponseEntity<String>(jo.toString(), responseHeaders, HttpStatus.CREATED);
	}
}
