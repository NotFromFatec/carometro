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
    @Column(name = "codigo", nullable = false)
    private String codigo;
    
    @Column(name = "utilizado", nullable = false)
    private boolean utilizado;
    
    @Column(name = "data", nullable = false)
    private LocalDate data;
    
    @ManyToOne(targetEntity = Administrador.class, fetch = FetchType.EAGER)
    @JoinColumn(name = "id_administrador", nullable = false)
    private Administrador administrador;

    public String getDataFormatada() {
        DateTimeFormatter data_formatada = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return data.format(data_formatada);
    }
}