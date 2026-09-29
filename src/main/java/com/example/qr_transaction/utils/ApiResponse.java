package com.example.qr_transaction.utils;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<T> {
    private String message;
    private int status;
    private T data;

    public ApiResponse(String message, int status) {
        this.message = message;
        this.status = status;
        this.data = null;
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(message, 200, data);
    }

    public static <T> ApiResponse<T> error(String message, int status) {
        return new ApiResponse<>(message, status, null);
    }
}
