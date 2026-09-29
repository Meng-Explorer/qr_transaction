package com.example.qr_transaction.exception;

public class BadRequestExceptionHandler extends RuntimeException {
    public BadRequestExceptionHandler(String message) {
        super(message);
    }
}
