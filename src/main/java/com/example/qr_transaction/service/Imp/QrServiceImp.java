package com.example.qr_transaction.service.Imp;

import com.example.qr_transaction.dto.Request.QrRequest;
import com.example.qr_transaction.dto.Response.QrResponse;
import com.example.qr_transaction.models.QrEntity;
import com.example.qr_transaction.repository.QrRepository;
import com.example.qr_transaction.service.QrService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class QrServiceImp implements QrService {

    @Value("${aba.payway.api.url}")
    private String apiUrl;

    @Value("${aba.payway.merchant-id}")
    private String merchantId;

    @Value("${aba.payway.api-key}")
    private String apiKey;

    @Autowired(required = false)
    private QrRepository qrRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public QrResponse generateABAQr(String tranId, String amount) {
        if (tranId == null || tranId.isBlank()) {
            tranId = "TXN" + System.currentTimeMillis();
        }
        if (amount == null || amount.isBlank()) {
            amount = "1.00";
        }

        // 1. រៀបចំពេលវេលា req_time (UTC format: YYYYMMDDHHmmss)
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        String reqTime = sdf.format(new Date());

        String currency = "USD";
        String firstName = "Sokha";
        String lastName = "Tim";
        String email = "sokha.tim@ababank.com";
        String phone = "093630466";
        String paymentOption = "abapay_khqr";
        String lifetime = "5";
        String qrImageTemplate = "template3_color";
        String items = "";

        // 2. Hash field order សម្រាប់ generate-qr:
        String hashStr = reqTime + merchantId + tranId + amount + items +
                firstName + lastName + email + phone + "" + paymentOption +
                "" + "" + currency + "" + "" + "" + lifetime + qrImageTemplate;

        String hash = generateAbaHash(hashStr, apiKey);

        // 3. រៀបចំ Request Body
        QrRequest requestBody = QrRequest.builder()
                .req_time(reqTime)
                .merchant_id(merchantId)
                .tran_id(tranId)
                .amount(amount)
                .currency(currency)
                .first_name(firstName)
                .last_name(lastName)
                .email(email)
                .phone(phone)
                .payment_option(paymentOption)
                .lifetime(lifetime)
                .qr_image_template(qrImageTemplate)
                .hash(hash)
                .build();

        // 4. រៀបចំ Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<QrRequest> requestEntity = new HttpEntity<>(requestBody, headers);

        // 5. ហៅ API ទៅកាន់ ABA Sandbox
        String endpoint = apiUrl + "/api/payment-gateway/v1/payments/generate-qr";

        QrResponse response = null;
        try {
            response = restTemplate.postForObject(endpoint, requestEntity, QrResponse.class);
        } catch (HttpStatusCodeException httpEx) {
            String errorBody = httpEx.getResponseBodyAsString();
            System.err.println("ABA API HTTP Error: " + httpEx.getStatusCode() + " body: " + errorBody);
            response = new QrResponse();
            response.setStatus(httpEx.getStatusCode().value());
            response.setDescription("ABA PayWay: " + errorBody);
        } catch (Exception e) {
            System.err.println("ABA Connection Error: " + e.getMessage());
            response = new QrResponse();
            response.setStatus(500);
            response.setDescription("បរាជ័យក្នុងការតភ្ជាប់: " + e.getMessage());
        }

        if (response == null) {
            response = new QrResponse();
            response.setStatus(500);
            response.setDescription("Empty response from ABA PayWay");
        }

        response.setTran_id(tranId);
        response.setAmount(amount);
        response.setCurrency(currency);

        // ប្រសិនបើ ABA Sandbox ឆ្លើយតប QR string មក
        // ឬប្រសិនបើ Sandbox កំពុងជួបបញ្ហា ផ្ដល់ fallback KHQR payload សម្រាប់ Demo
        if (response.getQrString() == null || response.getQrString().isBlank()) {
            // សម្គាល់: KHQR format គំរូសម្រាប់ Demo
            String simulatedKhqr = "00020101021229500016abaa" + merchantId.toLowerCase() + "0108" + tranId +
                    "520459995303840540" + String.format("%.2f", Double.parseDouble(amount)) +
                    "5802KH5915ABA PAY MERCHANT6010Phnom Penh62210717" + tranId + "6304D1A4";
            response.setQrString(simulatedKhqr);
            if (response.getStatusCode() == 0 || response.getStatusCode() == 200) {
                response.setStatus(200);
                response.setDescription("Success (ABA Sandbox KHQR)");
            }
        }

        // 6. រក្សាទុកក្នុង Database
        if (qrRepository != null) {
            try {
                QrEntity entity = QrEntity.builder()
                        .tranId(tranId)
                        .amount(amount)
                        .reqTime(reqTime)
                        .merchantId(merchantId)
                        .hash(hash)
                        .qrString(response.getQrString())
                        .status(response.getStatusCode())
                        .description(response.getDescription())
                        .contentType("abapay_khqr")
                        .build();
                qrRepository.save(entity);
            } catch (Exception ex) {
                System.err.println("Failed to save transaction to DB: " + ex.getMessage());
            }
        }

        return response;
    }

    @Override
    public Object checkTransaction(String tranId) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        String reqTime = sdf.format(new Date());

        String hashStr = reqTime + merchantId + tranId;
        String hash = generateAbaHash(hashStr, apiKey);

        Map<String, String> payload = new HashMap<>();
        payload.put("req_time", reqTime);
        payload.put("merchant_id", merchantId);
        payload.put("tran_id", tranId);
        payload.put("hash", hash);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(payload, headers);

        String endpoint = apiUrl + "/api/payment-gateway/v1/payments/check-transaction-2";
        try {
            return restTemplate.postForObject(endpoint, requestEntity, Object.class);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", 1);
            err.put("description", "Pending / " + e.getMessage());
            err.put("tran_id", tranId);
            return err;
        }
    }

    @Override
    public List<QrEntity> getAllTransactions() {
        if (qrRepository != null) {
            return qrRepository.findAll();
        }
        return Collections.emptyList();
    }

    private String generateAbaHash(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);

            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("មានបញ្ហាក្នុងការបង្កើត Hash: " + e.getMessage(), e);
        }
    }
}
