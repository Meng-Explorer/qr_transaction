package com.example.qr_transaction.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tran_id")
    private String tranId;

    private String amount;

    @Column(name = "req_time")
    private String reqTime;

    @Column(name = "merchant_id")
    private String merchantId;

    @Column(columnDefinition = "TEXT")
    private String hash;

    @Column(name = "qr_string", columnDefinition = "TEXT")
    private String qrString;

    private Integer status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String value) {
        this.contentType = value;
    }
}
