package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Egresso;

public interface EgressoRepository extends JpaRepository<Egresso, Integer> {
    Egresso findEgressoByUsername(String nome);
}