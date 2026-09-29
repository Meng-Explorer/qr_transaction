package com.example.qr_transaction.repository;

import com.example.qr_transaction.models.QrEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrRepository extends JpaRepository<QrEntity, Long> {
    Optional<QrEntity> findByTranId(String tranId);
}
