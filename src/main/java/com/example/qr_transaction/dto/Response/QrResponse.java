package com.example.qr_transaction.dto.Response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class QrResponse {
    private Object status;
    private String description;
    private String qrString;
    private String qrImage;
    private String abapay_deeplink;
    private String tran_id;
    private String amount;
    private String currency;

    public int getStatusCode() {
        if (status instanceof Number) {
            return ((Number) status).intValue();
        }
        if (status instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) status;
            Object code = map.get("code");
            if ("00".equals(code) || "0".equals(code)) return 200;
            return 400;
        }
        return 200;
    }

    public void setStatus(Object s) {
        this.status = s;
    }
}
