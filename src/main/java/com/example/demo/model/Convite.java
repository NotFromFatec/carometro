package com.example.demo.model;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "convite")
@Getter
@Setter
public class Convite {
    
    @Id
    @Column(name = "code", nullable = false)
    private String code;
    
    @Column(name = "used", nullable = false)
    private boolean used;
    
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    @ManyToOne(targetEntity = Administrador.class, fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = false)
    private Administrador createdBy;

}