package com.example.qr_transaction.service;

import com.example.qr_transaction.dto.Response.QrResponse;
import com.example.qr_transaction.models.QrEntity;

import java.util.List;

public interface QrService {
    QrResponse generateABAQr(String tranId, String amount);
    Object checkTransaction(String tranId);
    List<QrEntity> getAllTransactions();
}
