package com.example.qr_transaction.controller;

import com.example.qr_transaction.dto.Request.QrRequest;
import com.example.qr_transaction.dto.Response.QrResponse;
import com.example.qr_transaction.models.QrEntity;
import com.example.qr_transaction.service.QrService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/qr")
public class QrController {

    @Autowired
    private QrService qrService;

    // API សម្រាប់ឲ្យ Frontend ហៅមកកាន់ (គាំទ្រទាំង RequestParam និង RequestBody JSON)
    @PostMapping("/generate")
    public ResponseEntity<QrResponse> generateQR(
            @RequestParam(required = false) String tranId,
            @RequestParam(required = false) String amount,
            @RequestBody(required = false) QrRequest body) {

        String transactionId = tranId;
        String transactionAmount = amount;

        if (body != null) {
            if ((transactionId == null || transactionId.isBlank()) && body.getTran_id() != null) {
                transactionId = body.getTran_id();
            }
            if ((transactionAmount == null || transactionAmount.isBlank()) && body.getAmount() != null) {
                transactionAmount = body.getAmount();
            }
        }

        if (transactionId == null || transactionId.isBlank()) {
            transactionId = "TXN" + System.currentTimeMillis();
        }
        if (transactionAmount == null || transactionAmount.isBlank()) {
            transactionAmount = "1.00";
        }

        // ហៅទៅ Service ដើម្បីបង្កើត QR ពី ABA
        QrResponse response = qrService.generateABAQr(transactionId, transactionAmount);

        return ResponseEntity.ok(response);
    }

    // ពិនិត្យស្ថានភាព Transaction ពី ABA
    @PostMapping("/check")
    public ResponseEntity<?> checkTransaction(
            @RequestParam(required = false) String tranId,
            @RequestBody(required = false) QrRequest body) {
        String transactionId = tranId;
        if (body != null && body.getTran_id() != null) {
            transactionId = body.getTran_id();
        }
        Object result = qrService.checkTransaction(transactionId);
        return ResponseEntity.ok(result);
    }

    // ទាញយកប្រវត្តិ Transaction ពី Database
    @GetMapping("/history")
    public ResponseEntity<List<QrEntity>> getHistory() {
        return ResponseEntity.ok(qrService.getAllTransactions());
    }
}
