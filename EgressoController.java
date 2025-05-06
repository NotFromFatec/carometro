package com.example.demo.controllers;

import com.example.demo.model.Egresso;
import com.example.demo.service.EgressoService;
import com.google.gson.Gson;

import org.hibernate.Hibernate;
import org.hibernate.proxy.HibernateProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class EgressoController {

    @Autowired
    private EgressoService egressoService;

    // 1. Cadastrar o Egresso POST
    @PostMapping(value = "/api/v1/egressos", consumes = { "application/json", "text/plain" })
    public ResponseEntity<Object> criarEgresso(@RequestBody String body) {
        Egresso novoEgresso;
        System.out.println(body);

        try {
            novoEgresso = new Gson().fromJson(body, Egresso.class);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "JSON inválido"));
        }
        Optional<Egresso> existente = Optional
                .ofNullable(egressoService.findEgressoByUsername(novoEgresso.getUsername()));

        if (existente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username já em uso"));
        }

        novoEgresso.setPasswordHash(hashPassword(novoEgresso.getPasswordHash()));
        Egresso salvo = egressoService.save(novoEgresso);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // 2. Login do Egresso POST
    @PostMapping(value = "/api/v1/login/egresso", consumes = { "application/json", "text/plain" })
    public ResponseEntity<Object> loginEgresso(@RequestBody String body) {
        Map<String, String> logarComoEgresso;
        try {
            logarComoEgresso = new Gson().fromJson(body, Map.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "JSON inválido"));
        }
        String username = logarComoEgresso.get("username");
        String password = logarComoEgresso.get("password");

        Optional<Egresso> egressOptional = Optional.ofNullable(egressoService.findEgressoByUsername(username));

        if (egressOptional.isPresent()) {
            Egresso egresso = egressOptional.get();

            if (egresso.getPasswordHash().equals(hashPassword(password))) {
                return ResponseEntity.ok(Map.of("message", "Login realizado com sucesso ", "adminId", egresso.getId()));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
            }
        } else {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Invalid credentials"));
        }
    }

    // 3. Listar Egressos GET
    /*@GetMapping("/api/v1/egressos")
    public ResponseEntity<Object> listarEgressos() {
        List<Egresso> egressos = egressoService.listar();

        if (!egressos.isEmpty()) {
            return ResponseEntity.ok(egressos);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Nenhum egresso encontrado");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }*/

    // 4. Obter Egresso por ID GET
    @GetMapping("/api/v1/egressos/{id}")
    public ResponseEntity<String> getEgressoById(@PathVariable int id) {
        Optional<Egresso> encontro = Optional.ofNullable(egressoService.getEgressoById(id));

        if (encontro.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("{ \"message\": \"Egresso não encontrado\" }");
        }

        Egresso egresso = encontro.get();
        Hibernate.initialize(egresso.getContactLinks());
        if (egresso instanceof HibernateProxy) {
            egresso = (Egresso) ((HibernateProxy) egresso)
                    .getHibernateLazyInitializer()
                    .getImplementation();
        }

        String json = new Gson().toJson(egresso);
        return ResponseEntity
                .ok()
                .header("Content-Type", "application/json")
                .body(json);
    }

    // 5. Obter Egresso por Nome de Usuário GET
    // 3. Listar todos ou buscar por username GET
    @GetMapping("/api/v1/egressos")
    public ResponseEntity<Object> listarOuBuscarEgressos(@RequestParam(required = false) String username) {
        // Se o username foi passado, busca específico
        if (username != null && !username.isBlank()) {
            Optional<Egresso> encontroEgressoByUsername = Optional
                    .ofNullable(egressoService.findEgressoByUsername(username));

            if (encontroEgressoByUsername.isPresent()) {
                Egresso egresso = encontroEgressoByUsername.get();
                Gson gson = new Gson();
                String json = gson.toJson(egresso);
                HttpHeaders headers = new HttpHeaders();
                headers.set("Content-Type", "application/json");
                return new ResponseEntity<>(json, headers, HttpStatus.OK);

            } else {
                String errorJson = "{ \"message\": \"Egresso não encontrado\" }";
                HttpHeaders headers = new HttpHeaders();
                headers.set("Content-Type", "application/json");
                return new ResponseEntity<>(errorJson, headers, HttpStatus.NOT_FOUND);
            }
        }

        // Senão, lista todos
        List<Egresso> egressos = egressoService.listar();
        if (!egressos.isEmpty()) {
            return ResponseEntity.ok(egressos);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Nenhum egresso encontrado");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }

    // 6. Atualizar Egresso
    @PutMapping(value = "/api/v1/egressos/{id}", consumes = { "application/json", "text/plain" })
    public ResponseEntity<String> atualizarEgresso(@PathVariable int id, @RequestBody String body) {
        Optional<Egresso> egressoOptional = Optional.ofNullable(egressoService.getEgressoById(id));

        if (egressoOptional.isEmpty()) {
            String errorJson = "{ \"message\": \"Egresso not found\" }";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            return new ResponseEntity<>(errorJson, headers, HttpStatus.NOT_FOUND);
        }

        Egresso egresso = egressoOptional.get();

        Map<String, Object> atualizacoes;
        try {
            atualizacoes = new Gson().fromJson(body, Map.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{ \"message\": \"JSON inválido\" }");
        }
        if (atualizacoes.containsKey("name"))
            egresso.setName((String) atualizacoes.get("name"));
        if (atualizacoes.containsKey("profileImage"))
            egresso.setProfileImage((String) atualizacoes.get("profileImage"));
        if (atualizacoes.containsKey("faceImage"))
            egresso.setFaceImage((String) atualizacoes.get("faceImage"));
        if (atualizacoes.containsKey("facePoints"))
            egresso.setFacePoints((String) atualizacoes.get("facePoints"));
        if (atualizacoes.containsKey("course"))
            egresso.setCourse((String) atualizacoes.get("course"));
        if (atualizacoes.containsKey("graduationYear"))
            egresso.setGraduationYear((String) atualizacoes.get("graduationYear"));
        if (atualizacoes.containsKey("personalDescription"))
            egresso.setPersonalDescription((String) atualizacoes.get("personalDescription"));
        if (atualizacoes.containsKey("careerDescription"))
            egresso.setCareerDescription((String) atualizacoes.get("careerDescription"));
        if (atualizacoes.containsKey("verified"))
            egresso.setVerified((Boolean) atualizacoes.get("verified"));
        if (atualizacoes.containsKey("username"))
            egresso.setUsername((String) atualizacoes.get("username"));
        if (atualizacoes.containsKey("termsAccepted"))
            egresso.setTermsAccepted((Boolean) atualizacoes.get("termsAccepted"));
        if (atualizacoes.containsKey("inviteCode"))
            egresso.setInviteCode((String) atualizacoes.get("inviteCode"));
        if (atualizacoes.containsKey("contactLinks"))
            egresso.setContactLinks((List<String>) atualizacoes.get("contactLinks"));

        if (atualizacoes.containsKey("passwordHash")) {
            String novaSenha = (String) atualizacoes.get("passwordHash");
            egresso.setPasswordHash(hashPassword(novaSenha));
        }
        Egresso salvo = egressoService.save(egresso);

        Gson gson = new Gson();
        String json = gson.toJson(salvo);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        return new ResponseEntity<>(json, headers, HttpStatus.OK);
    }

    // 7. Deletar Egresso
    @DeleteMapping("/api/v1/egressos/{id}")
    public ResponseEntity<String> deletarEgresso(@PathVariable int id) {
        System.out.println(">>>> DELETE called with id = " + id);
        Optional<Egresso> egressoOptional = Optional.ofNullable(egressoService.getEgressoById(id));

        if (egressoOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("{ \"message\": \"Egresso not found\" }");
        }

        egressoService.deleEgressoById(id);
        return ResponseEntity.noContent().build();
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao hashear a senha", e);
        }
    }
}
