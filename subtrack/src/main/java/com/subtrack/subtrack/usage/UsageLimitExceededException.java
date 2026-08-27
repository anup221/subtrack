package com.subtrack.subtrack.usage;

public class UsageLimitExceededException extends RuntimeException {
    public UsageLimitExceededException(String message) {
        super(message);
    }
}