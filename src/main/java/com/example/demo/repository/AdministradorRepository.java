package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Administrador;

public interface AdministradorRepository extends JpaRepository<Administrador, Integer> {
	public Optional<Administrador> findByUsername(String username);
}
