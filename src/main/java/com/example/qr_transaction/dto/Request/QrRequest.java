package com.example.qr_transaction.dto.Request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QrRequest {
    private String req_time;
    private String merchant_id;
    private String tran_id;
    private String amount;
    private String currency;
    private String first_name;
    private String last_name;
    private String email;
    private String phone;
    private String payment_option;
    private String lifetime;
    private String qr_image_template;
    private String items;
    private String hash;
}
